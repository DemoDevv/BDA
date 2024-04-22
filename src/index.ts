import { Events } from "discord.js";
import Client from "./structs/Client";

const config = {
  TOKEN: Bun.env.TOKEN,
};
const client: Client = new Client(config);

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user!.tag}`);
});

client.start();
