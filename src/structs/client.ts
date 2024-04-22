import {
  Collection,
  Client as DiscordClient,
  Events,
  GatewayIntentBits,
} from "discord.js";

import fs from "node:fs";
import path from "node:path";

import deployCommands from "../helpers/deploy-commands";

import type { Config } from "../config";
import type { Command } from "../commands/types";

export default class Client extends DiscordClient {
  public config: Config;
  public commands: Collection<string, Command>;

  constructor(config: Config) {
    super({ intents: [GatewayIntentBits.Guilds] });
    this.config = config;
    this.commands = new Collection();
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
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        await interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      }
    });

    this.login(this.config.TOKEN);
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
}
