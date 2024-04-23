import type { Browser } from "puppeteer";
import Worker from "../structs/worker";
import puppeteer from "puppeteer";

export default class ScheduleWorker extends Worker {
  public interval: Timer | null = null;
  public URL_SCHEDULE = "https://edt.univ-nantes.fr/iut_nantes/g191826.xml";
  public browser: Browser | null = null;

  constructor() {
    super();
  }

  async start(): Promise<void> {
    console.log("Schedule worker started!");
    this.browser = await puppeteer.launch();
    this.interval = setInterval(() => {
      // emit an event when the schedule is updated
      this.execute();
    }, 300000);
  }

  async getSchedule(): Promise<void> {
    const page = await this.browser?.newPage();
    page?.setViewport({ width: 1920, height: 1080 });
    await page?.goto(this.URL_SCHEDULE);
    const scheduleTable = await page?.$(
      'body > span[style*="display: inline"][id]',
    );
    await scheduleTable?.screenshot({
      path: "ressources/schedule.png",
    });
    await page?.close();
    console.log("Schedule updated!");
  }

  async execute(): Promise<void> {
    // run every 5 minutes
    await this.getSchedule();
  }

  async stop(): Promise<void> {
    clearInterval(this.interval!);
    await this.browser?.close();
  }
}
