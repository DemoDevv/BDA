import type { Browser } from "puppeteer";
import puppeteer from "puppeteer";

import { ScheduleEvent } from "../events";

import compareSchedules from "../helpers/compare-schedules";

import Worker from "../structs/worker";
import type Client from "../structs/client";

export default class ScheduleWorker extends Worker {
  public interval: Timer | null = null;
  public URL_SCHEDULE = "https://edt.univ-nantes.fr/iut_nantes/g191826.xml";
  public browser: Browser | null = null;

  private lastSchedule: Buffer | undefined = undefined;

  constructor(client: Client) {
    super(client);
    this.client.on(ScheduleEvent.UPDATE, this.updateDiscordSchedule);
  }

  async start(): Promise<void> {
    console.log("Schedule worker started!");
    this.browser = await puppeteer.launch();
    this.interval = setInterval(() => {
      // emit an event when the schedule is updated
      this.execute();
    }, 5000); //  ajouter un system de dev et prod
  }

  async getSchedule(): Promise<Buffer | undefined> {
    const page = await this.browser?.newPage();
    page?.setViewport({ width: 1920, height: 1080 });
    await page?.goto(this.URL_SCHEDULE);
    const scheduleTable = await page?.$(
      'body > span[style*="display: inline"][id]',
    );
    const scheduleFile = await scheduleTable?.screenshot({
      path: "ressources/schedule.png",
    });
    await page?.close();
    console.log("Schedule updated!");
    return scheduleFile;
  }

  async execute(): Promise<void> {
    // run every 5 minutes
    const scheduleBuffer = await this.getSchedule();
    if (!scheduleBuffer) return;
    if (!this.lastSchedule) {
      this.lastSchedule = scheduleBuffer;
      return;
    }
    this.client.emit(ScheduleEvent.UPDATE, this.lastSchedule!, scheduleBuffer!);
  }

  async updateDiscordSchedule(
    lastSchedule: Buffer,
    newSchedule: Buffer,
  ): Promise<void> {
    // update the schedule in a discord channel
    if (!compareSchedules(lastSchedule, newSchedule)) return;
    console.log("test");
  }

  async stop(): Promise<void> {
    clearInterval(this.interval!);
    await this.browser?.close();
  }
}
