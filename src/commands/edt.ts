import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import type Client from "../structs/client";

import getSchedule from "../helpers/get-schedule";

export default {
  data: new SlashCommandBuilder()
    .setName("edt")
    .setDescription("Replies with the actual schedule."),
  async execute(
    interaction: CommandInteraction,
    client: Client,
  ): Promise<void> {
    const schedule = await getSchedule(
      client.browser!,
      client.config.URL_SCHEDULE,
    );
    if (!schedule) {
      await interaction.reply({
        content: "There was an error while getting the schedule!",
        ephemeral: true,
      });
      return;
    }
    await interaction.reply({
      files: [schedule],
    });
  },
};
