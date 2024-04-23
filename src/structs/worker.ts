import type Client from "./client";

export default abstract class Worker {
  public client: Client;
  public abstract interval: Timer | null;

  constructor(client: Client) {
    this.client = client;
    this.start();
  }

  async start(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async stop(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async execute(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
