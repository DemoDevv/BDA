export default abstract class Worker {
  public abstract interval: Timer | null;

  constructor() {
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
