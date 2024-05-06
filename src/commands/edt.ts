import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import type Client from "../structs/client";

import getSchedule from "../helpers/get-schedule";
import type ScheduleWorker from "../workers/schedule-worker";

import { RegisteredWorker } from "../workers";

export default {
  data: new SlashCommandBuilder()
    .setName("edt")
    .setDescription("Replies with the actual schedule.")
    .addBooleanOption((option) =>
      option
        .setName("update")
        .setDescription("save this response for schedule update")
        .setRequired(false),
    ),
  async execute(
    interaction: ChatInputCommandInteraction,
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
    if (interaction.options.getBoolean("update")) {
      const message = await interaction.fetchReply();
      const worker = client.getWorker(
        RegisteredWorker.SCHEDULE,
      ) as ScheduleWorker;

      worker.changeChannel(message.channelId, message.id, schedule);
    }
  },
};
