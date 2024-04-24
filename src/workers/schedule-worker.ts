import type { Browser } from "puppeteer";
import puppeteer from "puppeteer";

import { ScheduleEvent } from "../events";

import compareSchedules from "../helpers/compare-schedules";

import Worker from "../structs/worker";
import type Client from "../structs/client";
import type { MessageResolvable, TextChannel } from "discord.js";

export default class ScheduleWorker extends Worker {
  public interval: Timer | null = null;
  public URL_SCHEDULE = "https://edt.univ-nantes.fr/iut_nantes/g191826.xml";
  public browser: Browser | null = null;

  private lastSchedule: Buffer | undefined = undefined;
  private idChannel: string;
  private idMessage: string | null = null;

  constructor(client: Client) {
    super(client);
    this.idChannel = client.config.ID_CHANNEL_SCHEDULE!;
    this.client.on(ScheduleEvent.UPDATE, this.updateDiscordSchedule.bind(this));
  }

  async start(): Promise<void> {
    console.log("Schedule worker started!");
    if (this.client.config.CHROME_BIN) {
      this.browser = await puppeteer.launch({
        executablePath: this.client.config.CHROME_BIN,
        args: ["--no-sandbox"],
      });
    } else {
      this.browser = await puppeteer.launch();
    }
    this.interval = setInterval(
      () => {
        this.execute();
      },
      this.client.config.ENV == "DEV" ? 5000 : 300000,
    );
  }

  async getSchedule(): Promise<Buffer | undefined> {
    const page = await this.browser?.newPage();
    page?.setViewport({ width: 1920, height: 1080 });
    await page?.goto(this.URL_SCHEDULE);
    const scheduleTable = await page?.$(
      'body > span[style*="display: inline"][id]',
    );
    const scheduleBuffer = await scheduleTable?.screenshot();
    await page?.close();
    return scheduleBuffer;
  }

  async execute(): Promise<void> {
    const scheduleBuffer = await this.getSchedule();
    if (!scheduleBuffer) return;
    if (!this.lastSchedule) {
      this.lastSchedule = scheduleBuffer;
      await this.sendInScheduleChannel(scheduleBuffer);
      return;
    }
    console.log("Schedule updated!");
    this.client.emit(ScheduleEvent.UPDATE, this.lastSchedule!, scheduleBuffer!);
  }

  async sendInScheduleChannel(schedule: Buffer): Promise<void> {
    const channel = (await this.client.channels.fetch(
      this.idChannel,
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
      this.idChannel,
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

  changeChannel(idChannel: string): void {
    this.idChannel = idChannel;
    this.idMessage = null;
    this.lastSchedule = undefined;
  }

  async stop(): Promise<void> {
    clearInterval(this.interval!);
    await this.browser?.close();
  }
}
