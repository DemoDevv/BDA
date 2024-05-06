import type { Browser } from "puppeteer";

import type { MessageResolvable, TextChannel } from "discord.js";

import fs from "node:fs";
import path from "node:path";

import { ScheduleEvent } from "../events";

import compareSchedules from "../helpers/compare-schedules";
import { todayIsSchoolWeek } from "../helpers/school-weeks";
import getSchedule from "../helpers/get-schedule";
import getBrowser from "../helpers/get-browser";

import Worker from "../structs/worker";
import type Client from "../structs/client";

export default class ScheduleWorker extends Worker {
  public interval: Timer | null = null;
  public browser: Browser | null = null;

  private lastSchedule: Buffer | undefined = undefined;
  private idChannel: string | null = null;
  private idMessage: string | null = null;
  private dataPath = path.resolve(__dirname, "../../data/schedule.json");

  constructor(client: Client) {
    super(client);

    if (!client.config.ID_CHANNEL_SCHEDULE) {
      console.error("Channel ID not found in config");

      if (fs.existsSync(this.dataPath)) {
        const data = JSON.parse(fs.readFileSync(this.dataPath, "utf-8"));

        if (data.idChannel) {
          this.idChannel = data.idChannel;
        }
      } else {
        console.error(
          "Data file not found. Please provide a channel ID in the config file.",
        );
        this.stop();
        return;
      }
    } else {
      this.idChannel = client.config.ID_CHANNEL_SCHEDULE;
    }

    if (fs.existsSync(this.dataPath)) {
      const data = JSON.parse(fs.readFileSync(this.dataPath, "utf-8"));
      if (data.idMessage) {
        this.idMessage = data.idMessage;
      }
    }

    this.client.on(ScheduleEvent.UPDATE, this.updateDiscordSchedule.bind(this));
  }

  async start(): Promise<void> {
    console.log("Schedule worker started!");
    this.browser = await getBrowser(this.client.config.CHROME_BIN);
    this.interval = setInterval(
      () => {
        this.execute();
      },
      this.client.config.ENV == "DEV" ? 5000 : 300000,
    );
  }

  async execute(): Promise<void> {
    if (!(await todayIsSchoolWeek(this.browser!))) return;
    const scheduleBuffer = await getSchedule(
      this.browser!,
      this.client.config.URL_SCHEDULE,
    );
    if (!scheduleBuffer) return;
    if (!this.lastSchedule && !this.idMessage) {
      this.lastSchedule = scheduleBuffer;
      await this.sendInScheduleChannel(scheduleBuffer);
      return;
    } else if (!this.lastSchedule && this.idMessage) {
      // don't match with the same but that a minor bug
      this.lastSchedule = await this.readScheduleFromMessage(this.idMessage);
    }
    console.log("Schedule updated!");
    this.client.emit(ScheduleEvent.UPDATE, this.lastSchedule!, scheduleBuffer!);
  }

  async readScheduleFromMessage(idMessage: string): Promise<Buffer> {
    const channel = (await this.client.channels.fetch(
      this.idChannel!,
    )) as TextChannel;
    const message = await channel.messages.fetch(idMessage);
    const attachment = message.attachments.first();
    if (!attachment) throw new Error("No attachment found in message");
    const scheduleUrl = attachment.url;
    const scheduleBuffer = await fetch(scheduleUrl).then(
      async (res) => await res.arrayBuffer().then((buf) => Buffer.from(buf)),
    );
    return Promise.resolve(scheduleBuffer);
  }

  async sendInScheduleChannel(schedule: Buffer): Promise<void> {
    const channel = (await this.client.channels.fetch(
      this.idChannel!,
    )) as TextChannel;

    const message = await channel.send({
      files: [schedule],
    });

    if (!this.idMessage) {
      this.idMessage = message.id;
    }
  }

  async updateMessageSchedule(schedule: Buffer): Promise<void> {
    if (!this.idMessage) return;
    const channel = (await this.client.channels.fetch(
      this.idChannel!,
    )) as TextChannel;
    const message = (await channel.messages.fetch(
      this.idMessage,
    )) as MessageResolvable;
    const messagesManager = channel.messages;
    await messagesManager.edit(message, {
      files: [schedule],
    });
  }

  async updateDiscordSchedule(
    lastSchedule: Buffer,
    newSchedule: Buffer,
  ): Promise<void> {
    if (compareSchedules(lastSchedule, newSchedule)) return;
    if (!this.idMessage) await this.sendInScheduleChannel(newSchedule);
    else await this.updateMessageSchedule(newSchedule);
  }

  changeChannel(
    idChannel: string,
    idMessage: string | null = null,
    lastSchedule: Buffer | undefined = undefined,
  ): void {
    this.idChannel = idChannel;
    this.idMessage = idMessage;
    this.lastSchedule = lastSchedule;
  }

  async save(): Promise<void> {
    console.log("Saving data...");
    const data = JSON.stringify({
      idChannel: this.idChannel,
      idMessage: this.idMessage,
    });
    fs.writeFileSync(path.resolve(__dirname, "../../data/schedule.json"), data);
  }

  async stop(): Promise<void> {
    clearInterval(this.interval!);
    if (this.idChannel != null) await this.save();
    await this.browser?.close();
  }
}
