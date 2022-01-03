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
exports.DataGenerator = void 0;
const amqp = require("amqplib");
const types_1 = require("./types");
const uuid_1 = require("uuid");
const rabbit_config_1 = require("./rabbit-config");
const { RMQ_USER, RMQ_PASSWORD, RMQ_PORT, RMQ_HOST, RMQ_VIRTUAL_HOST } = rabbit_config_1.config;
class DataGenerator {
    constructor() {
        this.url = `amqp://${RMQ_USER}:${RMQ_PASSWORD}@${RMQ_HOST}:${RMQ_PORT}/${RMQ_VIRTUAL_HOST}`;
        console.log("Data url");
        console.log(this.url);
    }
    init() {
        this.setupConnection()
            .then(() => this.createQueues().then(() => this.generateData()))
            .catch((error) => console.log(error));
    }
    setupConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            this.connection = yield amqp.connect(this.url);
            this.channel = yield this.connection.createChannel();
            console.log("connection set");
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
    generateData() {
        setInterval(() => {
            const temperatureData = this.createRandomData(types_1.Types.TEMPERATURE);
            this.channel.sendToQueue(types_1.Types.TEMPERATURE, Buffer.from(JSON.stringify(temperatureData)));
            console.log(types_1.Types.TEMPERATURE, " send");
        }, 2500);
        setInterval(() => {
            const pressureData = this.createRandomData(types_1.Types.PRESSURE);
            this.channel.sendToQueue(types_1.Types.PRESSURE, Buffer.from(JSON.stringify(pressureData)));
            console.log(types_1.Types.PRESSURE, " send");
        }, 3500);
        setInterval(() => {
            const humidityData = this.createRandomData(types_1.Types.HUMIDITY);
            this.channel.sendToQueue(types_1.Types.HUMIDITY, Buffer.from(JSON.stringify(humidityData)));
            console.log(types_1.Types.HUMIDITY, " send");
        }, 4500);
    }
    createRandomData(type) {
        const data = {
            id: (0, uuid_1.v4)(),
            value: this.calculateValue(type),
            type: type,
            timestamp: Date.now(),
            unit: this.calculateUnit(type),
        };
        return data;
    }
    calculateValue(type) {
        switch (type) {
            case types_1.Types.HUMIDITY:
                return Math.floor(Math.random() * 30 + 10).toString();
            case types_1.Types.PRESSURE:
                return Math.floor(Math.random() * 100 + 950).toString();
            case types_1.Types.TEMPERATURE:
                return (Math.random() * (30 - 20) + 20).toFixed(1);
            default:
                break;
        }
    }
    calculateUnit(type) {
        switch (type) {
            case types_1.Types.HUMIDITY:
                return "%";
            case types_1.Types.PRESSURE:
                return "hPa";
            case types_1.Types.TEMPERATURE:
                return "C";
            default:
                break;
        }
    }
    sleep(ms) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => setTimeout(resolve, ms));
        });
    }
}
exports.DataGenerator = DataGenerator;
//# sourceMappingURL=data-generator.js.map