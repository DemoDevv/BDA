import puppeteer from "puppeteer";
import type { Browser } from "puppeteer";
import type { ElementHandle } from "puppeteer";

import Worker from "../structs/worker";
import type Client from "../structs/client";

export default class FeuilleWorker extends Worker {
  public interval: Timer | null = null;
  public URL_SCHEDULE = "https://edt.univ-nantes.fr/iut_nantes/g191826.xml";
  public browser: Browser | null = null;

  public idRole: string | null = null;

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
      this.client.config.ENV == "DEV" ? 5000 : 7 * 24 * 60 * 60 * 1000,
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

    const members = (await guildWithRole?.members.fetch())!.filter(
      (member) => !member.user.bot,
    );

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
    await this.browser?.close();
  }
}
