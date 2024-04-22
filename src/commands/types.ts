import type { SlashCommandBuilder, CommandInteraction } from "discord.js";

type Command = {
  data: SlashCommandBuilder;
  execute: (interaction: CommandInteraction) => Promise<void>;
};

export type { Command };
