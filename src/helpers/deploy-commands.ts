import { REST, Routes } from "discord.js";

const rest = new REST({ version: "10" }).setToken(Bun.env.TOKEN!);

export default async (commandsJson: string[]) => {
  try {
    console.log(
      `Started refreshing ${commandsJson.length} application (/) commands.`,
    );

    await rest.put(Routes.applicationCommands(Bun.env.CLIENT_ID!), {
      body: commandsJson,
    });

    console.log(`Successfully reloaded application (/) commands.`);
  } catch (error) {
    console.error(error);
  }
};
