import type { SlashCommandBuilder, CommandInteraction } from "discord.js";
import type Client from "../structs/client";

type Command = {
  data: SlashCommandBuilder;
  execute: (interaction: CommandInteraction, client: Client) => Promise<void>;
};

export type { Command };
