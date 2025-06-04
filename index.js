import { AppServer } from "./app-server/server.js";
import { RpcServer } from "./rpc-server/server.js";
import { DirectServer } from "./direct-server/server.js";
import { NotificationServer } from "./notification-server/server.js";
import { QueueDefinitions } from "./rabbitmq/queue/index.js";
import { ExchangeDefinitions } from "./rabbitmq/exchange/index.js";

class Application {
  constructor() {
    this.appServer = new AppServer();
    this.rpcServer = new RpcServer(QueueDefinitions.RPC_QUEUE);
    this.directServerA = new DirectServer(ExchangeDefinitions.DIRECT_EXCHANGE, 'A', (msg) => {
      console.log("[ DirectServer A] RECIEVED:", msg.content.toString());
    });
    this.directServerB = new DirectServer(ExchangeDefinitions.DIRECT_EXCHANGE, 'B', (msg) => {
      console.log("[ DirectServer B] RECIEVED:", msg.content.toString());
    });

    this.groupNotificationServer = new NotificationServer(ExchangeDefinitions.NOTIFICATION_EXCHANGE, 'echoit.*', (msg) => {
      console.log("[ Group-NotificationServer ] RECIEVED:", msg.content.toString());
    });

    this.myNotificationServer = new NotificationServer(ExchangeDefinitions.NOTIFICATION_EXCHANGE, 'echoit.mjh', (msg) => {
      console.log("[ My-NotificationServer ] RECIEVED:", msg.content.toString());
    });
  
    this.moonNotificationServer = new NotificationServer(ExchangeDefinitions.NOTIFICATION_EXCHANGE, 'echoit.moon', (msg) => {
      console.log("[ Moon-NotificationServer ] RECIEVED:", msg.content.toString());
    });
  }

  async start() {
    console.log("Starting application...");
    try {
      this.appServer.run();
      this.rpcServer.run();
      this.directServerA.run();
      this.directServerB.run();
      this.groupNotificationServer.run();
      this.myNotificationServer.run();
      this.moonNotificationServer.run();
    } catch (error) {
      console.log("Error starting application:", error);
      await this.shutdown();
      throw error;
    }
  }

  async shutdown() {
    console.log("Shutting down gracefully...");
    try {
      // 역순으로 서비스 종료하기
      if (this.moonNotificationServer) await this.moonNotificationServer.shutdown();
      if (this.myNotificationServer) await this.myNotificationServer.shutdown();
      if (this.groupNotificationServer) await this.groupNotificationServer.shutdown();
      if (this.directServerB) await this.directServerB.shutdown();
      if (this.directServerA) await this.directServerA.shutdown();
      if (this.rpcServer) await this.rpcServer.shutdown();
      if (this.appServer) await this.appServer.shutdown();

      await new Promise(resolve => setTimeout(resolve, 1000));
  
      console.log("Shutdown complete");
      process.exit(0);
    } catch (error) {
      console.error("Error during shutdown:", error);
      process.exit(1);
    }
  }
}

const app = new Application();
app.start().catch(error => {
  system.error("Fatal error:", error);
  process.exit(1);
})

// ctrl+c
process.on("SIGINT", async function() {
  await app.shutdown()
});   
// kill <pid></pid>
process.on("SIGTERM", async () => await app.shutdown());