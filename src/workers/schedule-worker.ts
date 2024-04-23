import type { Browser } from "puppeteer";
import Worker from "../structs/worker";
import puppeteer from "puppeteer";

export default class ScheduleWorker extends Worker {
  public interval: Timer | null = null;
  public URL_SCHEDULE = "https://edt.univ-nantes.fr/iut_nantes/g191826.html";
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
    }, 10000);
  }

  async getSchedule(): Promise<void> {
    const page = await this.browser?.newPage();
    await page?.goto(this.URL_SCHEDULE);
    const scheduleTable = await page?.$("table");
    const clip = await scheduleTable?.boundingBox();
    console.log(clip);
    // await page?.screenshot({
    //   path: "ressources/schedule.png",
    //   clip: {
    //     x: clip?.x!,
    //     y: clip?.y!,
    //     width: clip?.width!,
    //     height: clip?.height!,
    //   },
    // });
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
