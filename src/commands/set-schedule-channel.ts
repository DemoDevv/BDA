import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import type Client from "../structs/client";
import type ScheduleWorker from "../workers/schedule-worker";

export default {
  data: new SlashCommandBuilder()
    .setName("set-schedule-channel")
    .setDescription("Set the channel to post the schedule in.")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel to post the schedule in.")
        .setRequired(true),
    ),
  async execute(
    interaction: ChatInputCommandInteraction,
    client: Client,
  ): Promise<void> {
    const channelId = interaction.options.getChannel("channel")?.id;
    client.config.ID_CHANNEL_SCHEDULE = channelId;
    const worker = client.workers.get("schedule-worker") as ScheduleWorker;
    worker.changeChannel(channelId!);
    await interaction.reply("Channel set!");
  },
};
