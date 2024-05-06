import type { Browser } from "puppeteer";

export default async (
  browser: Browser,
  url: string,
): Promise<Buffer | undefined> => {
  const page = await browser.newPage();
  page?.setViewport({ width: 1000, height: 1000 });
  await page?.goto(url);
  const scheduleTable = await page?.$(
    'body > span[style*="display: inline"][id]',
  );
  const scheduleBuffer = await scheduleTable?.screenshot();
  await page?.close();
  return scheduleBuffer;
};
