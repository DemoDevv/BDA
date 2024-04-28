import puppeteer from "puppeteer";
import type { Browser } from "puppeteer";
import type { ElementHandle } from "puppeteer";

import Worker from "../structs/worker";
import type Client from "../structs/client";

type SchoolWeek = "tnot_empty_week_slot";
type SchoolType = SchoolWeek | "tempty_week_slot";
type WeekData = {
  weekNumber: number;
  isSchoolWeek: SchoolType;
};

export default class FeuilleWorker extends Worker {
  public interval: Timer | null = null;
  public timeout: Timer | null = null;
  public URL_SCHEDULE = "https://edt.univ-nantes.fr/iut_nantes/g191826.xml";
  public browser: Browser | null = null;

  public idRole: string | null = null;
  private alternants: string[] = [
    "Maximilien B",
    "Léo C",
    "Thomas H",
    "Mathieu L",
    "Edouard M",
    "Julien S",
    "Loïc T",
    "Nolan V",
    "Louis V",
  ];

  constructor(client: Client) {
    super(client);
    if (!client.config.ID_ROLE_FEUILLE) {
      console.error("Role ID not found");
      this.stop();
      return;
    }
    this.idRole = client.config.ID_ROLE_FEUILLE!;
  }

  async start(): Promise<void> {
    if (this.client.config.CHROME_BIN) {
      this.browser = await puppeteer.launch({
        executablePath: this.client.config.CHROME_BIN,
        args: ["--no-sandbox"],
      });
    } else {
      this.browser = await puppeteer.launch();
    }
    // wait the sunday at 00:00 to start the worker
    const now = new Date();
    const timeToWait =
      this.client.config.ENV == "DEV"
        ? 5000
        : 7 * 24 * 60 * 60 * 1000 -
          (now.getDay() * 24 * 60 * 60 * 1000 +
            now.getHours() * 60 * 60 * 1000 +
            now.getMinutes() * 60 * 1000 +
            now.getSeconds() * 1000 +
            now.getMilliseconds());
    console.log(`Waiting ${timeToWait}ms to start the worker`);
    this.timeout = setTimeout(() => {
      console.log("[Feuille Worker] Starting the worker");
      this.interval = setInterval(
        () => {
          this.execute();
        },
        this.client.config.ENV == "DEV" ? 5000 : 7 * 24 * 60 * 60 * 1000,
      );
    }, timeToWait);
  }

  async getSchoolWeeks(): Promise<WeekData[]> {
    const page = await this.browser?.newPage();
    await page?.goto(this.URL_SCHEDULE);
    const weeks = (await page?.$$(
      ".weeks_table > tbody > tr:nth-child(1) > td",
    )) as ElementHandle<HTMLDivElement>[];
    const weeksData = await Promise.all(
      weeks.map(async (week) => {
        const weekNumber = (await page?.evaluate(
          (el) => el.innerText,
          week,
        )) as string;
        const isSchoolWeek = (await page?.evaluate(
          (el) => el.className,
          week,
        )) as SchoolType;
        return { weekNumber, isSchoolWeek };
      }),
    );
    await page?.close();
    return Promise.resolve(
      weeksData
        .slice(1)
        .filter((week) => week.isSchoolWeek == "tnot_empty_week_slot")
        .map((week) => {
          return {
            weekNumber: parseInt(week.weekNumber),
            isSchoolWeek: "tnot_empty_week_slot",
          };
        }),
    );
  }

  async getCurrentWeek(): Promise<number> {
    const page = await this.browser?.newPage();
    await page?.goto(this.URL_SCHEDULE);
    const current_week = (await page?.$(
      "#wkSelList",
    )) as ElementHandle<HTMLSelectElement>;
    const current_week_value = (await page?.evaluate(
      (el) => el!.value,
      current_week,
    )) as unknown as number;
    await page?.close();
    return Promise.resolve(current_week_value);
  }

  async execute(): Promise<void> {
    const currentWeek = await this.getCurrentWeek();
    const guildWithRole = this.client.guilds.cache.find((guild) =>
      guild.roles.cache.has(this.idRole!),
    );
    const role = guildWithRole?.roles.cache.get(this.idRole!);

    let members;

    if (this.client.config.ENV == "DEV") {
      members = (await guildWithRole?.members.fetch())!.filter(
        (member) => !member.user.bot,
      );
    } else {
      members = (await guildWithRole?.members.fetch())!
        .filter((member) => !member.user.bot)
        .sort((a, b) => {
          const aIndex = this.alternants.indexOf(a.displayName);
          const bIndex = this.alternants.indexOf(b.displayName);
          return aIndex - bIndex;
        });
    }

    // get the last member with the role if he exists
    const lastMember = members?.find((member) =>
      member.roles.cache.has(role!.id),
    );
    if (lastMember) {
      await lastMember.roles.remove(role!);
    }

    const targetMember = members?.at(currentWeek % members.size);
    if (!targetMember) return;
    await targetMember.roles.add(role!);
    await targetMember?.user.send(
      `Salut ${targetMember.displayName}, tu as la feuille cette semaine.`,
    );
  }

  async stop(): Promise<void> {
    clearInterval(this.interval!);
    clearTimeout(this.timeout!);
    await this.browser?.close();
  }
}
