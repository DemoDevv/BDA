import puppeteer from "puppeteer";
import type { Browser } from "puppeteer";

export default async (chromeBin: string | undefined): Promise<Browser> => {
  if (chromeBin) {
    return await puppeteer.launch({
      executablePath: chromeBin,
      args: ["--no-sandbox"],
    });
  } else {
    return await puppeteer.launch();
  }
};
