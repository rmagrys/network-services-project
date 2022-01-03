import * as amqp from "amqplib";
import { Connection, Channel, Replies } from "amqplib";
import { Types } from "./types";
import { v4 } from "uuid";
import { Data } from "./data";
import { config } from "./rabbit-config";
import { log } from "./logger";

const { RMQ_USER, RMQ_PASSWORD, RMQ_PORT, RMQ_HOST, RMQ_VIRTUAL_HOST } = config;

export class DataGenerator {
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
          log.info("Start generating data...");
          this.generateData();
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

  private generateData(): void {
    setInterval(() => {
      const temperatureData: Data = this.createRandomData(Types.TEMPERATURE);
      log.log(Types.TEMPERATURE, " sent: ", JSON.stringify(temperatureData));
      this.channel.sendToQueue(
        Types.TEMPERATURE,
        Buffer.from(JSON.stringify(temperatureData))
      );
    }, 2500);

    setInterval(() => {
      const pressureData: Data = this.createRandomData(Types.PRESSURE);
      log.log(Types.PRESSURE, " sent: ", JSON.stringify(pressureData));
      this.channel.sendToQueue(
        Types.PRESSURE,
        Buffer.from(JSON.stringify(pressureData))
      );
    }, 3500);

    setInterval(() => {
      const humidityData: Data = this.createRandomData(Types.HUMIDITY);
      log.log(Types.HUMIDITY, " sent: ", JSON.stringify(humidityData));
      this.channel.sendToQueue(
        Types.HUMIDITY,
        Buffer.from(JSON.stringify(humidityData))
      );
    }, 4500);
  }

  private createRandomData(type: Types): Data {
    const data: Data = {
      id: v4(),
      value: this.calculateValue(type),
      type: type,
      timestamp: Date.now(),
      unit: this.calculateUnit(type),
    };

    return data;
  }

  private calculateValue(type: Types): string {
    switch (type) {
      case Types.HUMIDITY:
        return Math.floor(Math.random() * 30 + 10).toString();
      case Types.PRESSURE:
        return Math.floor(Math.random() * 100 + 950).toString();
      case Types.TEMPERATURE:
        return (Math.random() * 10 + 20).toFixed(1);
      default:
        break;
    }
  }

  private calculateUnit(type: Types): string {
    switch (type) {
      case Types.HUMIDITY:
        return "%";
      case Types.PRESSURE:
        return "hPa";
      case Types.TEMPERATURE:
        return "C";
      default:
        break;
    }
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
