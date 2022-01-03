"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataConsumer = void 0;
const amqp = require("amqplib");
const rabbit_config_1 = require("./rabbit-config");
const logger_1 = require("./logger");
const types_1 = require("./types");
const { RMQ_USER, RMQ_PASSWORD, RMQ_HOST, RMQ_PORT, RMQ_VIRTUAL_HOST } = rabbit_config_1.config;
class DataConsumer {
    constructor() {
        this.url = `amqp://${RMQ_USER}:${RMQ_PASSWORD}@${RMQ_HOST}:${RMQ_PORT}/${RMQ_VIRTUAL_HOST}`;
    }
    init() {
        try {
            this.setupConnection().then(() => {
                logger_1.log.info(`Connected to ${RMQ_HOST}:${RMQ_PORT}/${RMQ_VIRTUAL_HOST}`);
                this.createQueues().then(() => {
                    logger_1.log.info(`Queues asserted: ${Object.keys(types_1.Types).map((type) => `\n${type}`)}`);
                    this.consumeData();
                });
            });
        }
        catch (error) {
            logger_1.log.error(error);
        }
    }
    setupConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            this.connection = yield amqp.connect(this.url);
            this.channel = yield this.connection.createChannel();
        });
    }
    createQueues() {
        return __awaiter(this, void 0, void 0, function* () {
            const humQuePromise = yield this.channel.assertQueue(types_1.Types.HUMIDITY);
            const pressQuePromise = yield this.channel.assertQueue(types_1.Types.PRESSURE);
            const tempQuePromise = yield this.channel.assertQueue(types_1.Types.TEMPERATURE);
            return Promise.all([humQuePromise, pressQuePromise, tempQuePromise]);
        });
    }
    consumeData() {
        this.channel.consume(types_1.Types.HUMIDITY, (message) => {
            logger_1.log.info(message);
        });
        this.channel.consume(types_1.Types.PRESSURE, (message) => {
            logger_1.log.info(message);
        });
        this.channel.consume(types_1.Types.TEMPERATURE, (message) => {
            logger_1.log.info(message);
        });
    }
}
exports.DataConsumer = DataConsumer;
//# sourceMappingURL=data-consumer.js.map