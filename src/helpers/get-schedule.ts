import type { Browser } from "puppeteer";

export default async (
  browser: Browser,
  url: string | undefined,
): Promise<Buffer | undefined> => {
  try {
    const page = await browser.newPage();
    page.setViewport({ width: 1000, height: 1000 });
    if (!url) throw new Error("URL_SCHEDULE is not defined!");
    await page.goto(url);
    await page.waitForSelector('body > span[style*="display: inline"][id]');
    const scheduleTable = await page.$(
      'body > span[style*="display: inline"][id]',
    );
    const scheduleBuffer = await scheduleTable?.screenshot();
    await page.close();
    return scheduleBuffer;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};
