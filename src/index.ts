import { Events } from "discord.js";
import config from "./config";
import Client from "./structs/client";

const client: Client = new Client(config);

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user!.tag}`);
});

process.on("SIGINT", async () => {
  console.log("Shutting down...");
  await client.stop();
  process.exit();
});

client.start();
