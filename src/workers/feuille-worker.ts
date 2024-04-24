import type { Browser } from "puppeteer";
import puppeteer from "puppeteer";

import Worker from "../structs/worker";

export default class FeuilleWorker extends Worker {
  public interval: Timer | null = null;
  public URL_SCHEDULE = "https://edt.univ-nantes.fr/iut_nantes/g191826.xml";
  public browser: Browser | null = null;

  async start(): Promise<void> {
    console.log("Feuille worker started!");
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
      this.client.config.ENV == "DEV" ? 5000 : 300000, // TODO change to each week
    );
  }

  async execute(): Promise<void> {
    // document.getElementById('wkSelList').value
    // class weeks_table tr td[] - le premier (donc value + 1)
    // obtenir la value du a
    // faire une liste des utilisateurs et prendre celui qui correspond a l'index
  }

  async stop(): Promise<void> {
    clearInterval(this.interval!);
    await this.browser?.close();
  }
}
