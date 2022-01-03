import * as amqp from "amqplib";
import { Connection, Channel, Replies } from "amqplib";
import { config } from "./rabbit-config";
import { log } from "./logger";
import { Types } from "./types";

const { RMQ_USER, RMQ_PASSWORD, RMQ_HOST, RMQ_PORT, RMQ_VIRTUAL_HOST } = config;

export class DataConsumer {
  private connection: Connection;
  private channel: Channel;
  private url: string;

  constructor() {
    this.url = `amqp://${RMQ_USER}:${RMQ_PASSWORD}@${RMQ_HOST}:${RMQ_PORT}/${RMQ_VIRTUAL_HOST}`;
  }

  public init() {
    try {
      this.setupConnection().then(() => {
        log.info(`Connected to ${RMQ_HOST}:${RMQ_PORT}/${RMQ_VIRTUAL_HOST}`);
        this.createQueues().then(() => {
          log.info(
            `Queues asserted: ${Object.keys(Types).map((type) => `\n${type}`)}`
          );
          this.consumeData();
        });
      });
    } catch (error) {
      log.error(error);
    }
  }

  private async setupConnection() {
    this.connection = await amqp.connect(this.url);
    this.channel = await this.connection.createChannel();
  }

  private async createQueues(): Promise<Array<Replies.AssertQueue>> {
    const humQuePromise = await this.channel.assertQueue(Types.HUMIDITY);
    const pressQuePromise = await this.channel.assertQueue(Types.PRESSURE);
    const tempQuePromise = await this.channel.assertQueue(Types.TEMPERATURE);
    return Promise.all([humQuePromise, pressQuePromise, tempQuePromise]);
  }

  private consumeData() {
    this.channel.consume(Types.HUMIDITY, (message) => {
      log.info(message.content.toString());
    });

    this.channel.consume(Types.PRESSURE, (message) => {
      log.info(message.content.toString());
    });

    this.channel.consume(Types.TEMPERATURE, (message) => {
      log.info(message.content.toString());
    });
  }
}
