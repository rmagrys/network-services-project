import * as amqp from "amqplib";
import { Connection, Channel, Replies } from "amqplib";
import { config } from "./rabbit-config";
import { log } from "./logger";
import { Types } from "./types";
import { Data } from "./data";

const { RMQ_USER, RMQ_PASSWORD, RMQ_HOST, RMQ_PORT, RMQ_VIRTUAL_HOST } = config;

export class DataConsumer {
  private connection: Connection;
  private channel: Channel;
  private url: string;

  constructor() {
    this.url = `amqp://${RMQ_USER}:${RMQ_PASSWORD}@${RMQ_HOST}:${RMQ_PORT}/${RMQ_VIRTUAL_HOST}`;
    log.info(this.url);
  }

  public async init(): Promise<Replies.AssertQueue[]> {
    log.info("Setting up connection to RabbitMQ");
    const createQuePromise = this.setupConnection().then(
      async () => await this.createQueues()
    );
    log.info(`Connected to ${RMQ_HOST}:${RMQ_PORT}/${RMQ_VIRTUAL_HOST}`);
    //const connectionPromise = await this.setupConnection().then(async () => {

    // return this.createQueues().then(() => {
    //log.info( `Queues asserted: ${Object.keys(Types).map((type) => `\n${type}`)}`);
    return createQuePromise;
  }

  private async setupConnection() {
    this.connection = await amqp.connect(this.url);
    this.channel = await this.connection.createChannel();
  }

  private async createQueues(): Promise<Array<Replies.AssertQueue>> {
    const humQuePromise = this.channel.assertQueue(Types.HUMIDITY);
    const pressQuePromise = this.channel.assertQueue(Types.PRESSURE);
    const tempQuePromise = this.channel.assertQueue(Types.TEMPERATURE);
    return Promise.all([humQuePromise, pressQuePromise, tempQuePromise]);
  }

  public consumeData(sendingCallback: CallableFunction) {
    log.info("Starting to consume data from RabbitMQ");

    this.channel.consume(Types.HUMIDITY, (message) => {
      log.info(message.content.toString());
      const data: Data = JSON.parse(message.content.toString());
      sendingCallback(Types.HUMIDITY, data);
    });

    this.channel.consume(Types.PRESSURE, (message) => {
      log.info(message.content.toString());
      const data: Data = JSON.parse(message.content.toString());
      sendingCallback(Types.PRESSURE, data);
    });

    this.channel.consume(Types.TEMPERATURE, (message) => {
      log.info(message.content.toString());
      const data: Data = JSON.parse(message.content.toString());
      sendingCallback(Types.HUMIDITY, data);
    });
  }
}
