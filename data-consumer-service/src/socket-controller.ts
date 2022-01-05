import { createServer, Server as httpServer } from "http";
import { Server as ioServer, Socket } from "socket.io";
import { log } from "./logger";
import { Data } from "./data";

export class SocketController {
  private httpServer: httpServer;
  private io: ioServer;
  private port: number;

  constructor(port: number) {
    this.port = port;
    this.httpServer = createServer();
    this.io = new ioServer(this.httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });
  }

  public async init() {
    this.io.on("connection", (socket: Socket) => {
      log.info("Connection by socket.io set");
      socket.emit("Successfully connected to server");

      socket.on("disconnect", () => {
        console.log("disconnected");
      });
    });
    log.info(`Server listening on port ${this.port}`);
    this.httpServer.listen(this.port);
  }

  public sendToChannel = (event: string, eventData: Data): void => {
    this.io.emit(event, eventData);
  };
}
// options
