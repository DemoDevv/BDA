import type { ElementHandle } from "puppeteer";
import type { Browser } from "puppeteer";

export type SchoolWeek = "tnot_empty_week_slot";
export type SchoolType = SchoolWeek | "tempty_week_slot";
export type WeekData = {
  weekIndex: number;
  weekNumber: number;
  isSchoolWeek: SchoolType;
};

const URL_SCHEDULE = "https://edt.univ-nantes.fr/iut_nantes/g191826.xml";

const getSchoolWeeks = async function (browser: Browser): Promise<WeekData[]> {
  const page = await browser.newPage();
  await page?.goto(URL_SCHEDULE);
  const weeks = (await page?.$$(
    ".weeks_table > tbody > tr:nth-child(1) > td",
  )) as ElementHandle<HTMLDivElement>[];
  const weeksData = await Promise.all(
    weeks.map(async (week) => {
      return await page?.evaluate((el) => {
        return {
          weekNumber: el.innerText as string,
          isSchoolWeek: el.className as SchoolType,
        };
      }, week);
    }),
  );
  await page?.close();
  return Promise.resolve(
    weeksData
      .slice(1)
      .map((week) => {
        return {
          weekIndex: weeksData.indexOf(week),
          weekNumber: parseInt(week.weekNumber),
          isSchoolWeek: week.isSchoolWeek as SchoolType,
        };
      })
      .filter((week) => week.isSchoolWeek == "tnot_empty_week_slot"),
  );
};

const getCurrentWeek = async function (browser: Browser): Promise<number> {
  const page = await browser.newPage();
  await page?.goto(URL_SCHEDULE);
  const current_week = (await page?.$(
    "#wkSelList",
  )) as ElementHandle<HTMLSelectElement>;
  const current_week_value = parseInt(
    await page?.evaluate((el) => el!.value, current_week),
  );
  await page?.close();
  return Promise.resolve(current_week_value);
};

const isSchoolWeek = async function (
  week: number,
  browser: Browser,
): Promise<boolean> {
  return await getSchoolWeeks(browser).then((weeks) => {
    return weeks.some((w) => w.weekIndex == week);
  });
};

const todayIsSchoolWeek = async function (browser: Browser): Promise<boolean> {
  return await getCurrentWeek(browser).then((week) => {
    return isSchoolWeek(week + 1, browser);
  });
};

export { getSchoolWeeks, getCurrentWeek, isSchoolWeek, todayIsSchoolWeek };
