import { DataConsumer } from "./data-consumer";
import { SocketController } from "./socket-controller";
import { config } from "./server-config";
import { log } from "./logger";

const { PORT } = config;

export class App {
  private dataConsumer: DataConsumer;
  private socketController: SocketController;

  constructor() {
    this.dataConsumer = new DataConsumer();
    this.socketController = new SocketController(PORT);
  }

  public async init() {
    this.socketController.init();
    await this.dataConsumer
      .init()
      .then(() => this.runDataConsumingAndSending())
      .catch(() => log.info("something went wrong"));
  }

  public runDataConsumingAndSending() {
    this.dataConsumer.consumeData(this.socketController.sendToChannel);
  }
}
