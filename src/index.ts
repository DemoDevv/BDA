import { Events } from "discord.js";
import config from "./config";
import Client from "./structs/client";

const client: Client = new Client(config);

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user!.tag}`);
});

process.on("SIGINT", () => {
  client.getWorkers().forEach((worker) => worker.stop());
  client.config.save();
  process.exit();
});

client.start();
