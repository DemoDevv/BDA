import {
  Collection,
  Client as DiscordClient,
  Events,
  GatewayIntentBits,
  Guild,
  User,
} from "discord.js";

import fs from "node:fs";
import path from "node:path";

import deployCommands from "../helpers/deploy-commands";

import type { Config } from "../types";
import type { Command } from "../commands/types";
import type Worker from "./worker";

export default class Client extends DiscordClient {
  public config: Config;
  public commands: Collection<string, Command>;
  public workers: Collection<string, Worker>;

  constructor(config: Config) {
    super({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
    });
    this.config = config;
    this.commands = new Collection();
    this.workers = new Collection();
  }

  async start(): Promise<void> {
    const commandsJson = await this.loadCommands();

    console.log("Loaded all commands!");

    await deployCommands(commandsJson);

    this.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isCommand()) return;

      const command = this.commands.get(interaction.commandName);

      if (!command) return;

      try {
        await command.execute(interaction, this);
      } catch (error) {
        console.error(error);
        await interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      }
    });

    await this.loadWorkers();

    this.login(
      this.config.ENV == "DEV" ? this.config.DEV_TOKEN : this.config.TOKEN,
    );
  }

  async loadCommands(): Promise<string[]> {
    let commandsJson = [];

    const commandsDir = path.resolve("./src/commands");
    const commandsFiles = fs
      .readdirSync(commandsDir)
      .filter((file) => file.endsWith(".ts"))
      .filter((file) => !file.startsWith("types"));

    for (const file of commandsFiles) {
      const command = await import(path.resolve(commandsDir, file));
      this.commands.set(command.default.data.name, command.default);
      commandsJson.push(command.default.data.toJSON());
      console.log(`Loaded command: ${command.default.data.name}`);
    }

    return commandsJson;
  }

  async loadWorkers(): Promise<void> {
    const workersDir = path.resolve("./src/workers");
    const workersFiles = fs
      .readdirSync(workersDir)
      .filter((file) => file.endsWith(".ts"));

    for (const file of workersFiles) {
      const Worker = await import(path.resolve(workersDir, file));
      const worker: Worker = new Worker.default(this);
      this.workers.set(file.split(".")[0], worker);
      console.log(`Loaded worker: ${file}`);
    }
  }

  getWorkers(): Collection<string, Worker> {
    return this.workers;
  }
}
