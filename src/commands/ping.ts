import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import type Client from "../structs/client";

export default {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),
  async execute(
    interaction: CommandInteraction,
    _client: Client,
  ): Promise<void> {
    await interaction.reply("Pong!");
  },
};
