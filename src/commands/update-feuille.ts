import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import type Client from "../structs/client";

import { RegisteredWorker } from "../workers";
import type FeuilleWorker from "../workers/feuille-worker";

export default {
  data: new SlashCommandBuilder()
    .setName("update-feuille")
    .setDescription("Update the feuille manually."),
  async execute(
    interaction: ChatInputCommandInteraction,
    client: Client,
  ): Promise<void> {
    const worker = client.getWorker(RegisteredWorker.FEUILLE) as FeuilleWorker;
    await worker.execute();
    await interaction.reply("Feuille updated!");
  },
};
