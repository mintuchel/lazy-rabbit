const { AppServer } = require("./app-server/server");
const { RpcServer } = require("./rpc-server/server");
const { DirectServer } = require("./direct-server/server");
const { NotificationServer } = require("./notification-server/server");
const { QueueDefinitions } = require("./rabbitmq/queue");
const { ExchangeDefinitions } = require("./rabbitmq/exchange");
const { messageBroker } = require("./rabbitmq");

const system = require("./system");

class Application {
  constructor() {
    this.appServer = new AppServer();
    this.rpcServer = new RpcServer(QueueDefinitions.RPC_QUEUE);
    this.directServerA = new DirectServer(ExchangeDefinitions.DIRECT_EXCHANGE, 'A', (msg) => {
      console.log("[RECIEVED] DirectServer A:", msg.content.toString());
    });
    this.directServerB = new DirectServer(ExchangeDefinitions.DIRECT_EXCHANGE, 'B', (msg) => {
      console.log("[RECIEVED] DirectServer B:", msg.content.toString());
    });

    this.groupNotificationServer = new NotificationServer(ExchangeDefinitions.NOTIFICATION_EXCHANGE, 'echoit.*', (msg) => {
      console.log("[RECIEVED] NotificationServer (GROUP):", msg.content.toString());
    });

    this.myNotificationServer = new NotificationServer(ExchangeDefinitions.NOTIFICATION_EXCHANGE, 'echoit.mjh', (msg) => {
      console.log("[RECIEVED] NotificationServer (MJH):", msg.content.toString());
    });

    this.moonNotificationServer = new NotificationServer(ExchangeDefinitions.NOTIFICATION_EXCHANGE, 'echoit.moon', (msg) => {
      console.log("[RECIEVED] NotificationServer (MOON):", msg.content.toString());
    });
  }

  async start() {
    system.debug("Starting application...");

    const self = this;

    process.on("SIGHUP", () => {
      self.shutdown();
    });
    
    process.on("SIGINT", () => {
      self.shutdown();
    });
    
    process.on("SIGTERM", () => {
      self.shutdown();
    });

    try {
      // connection 하나만 생성되게 하기 위해 messageBroker.run 에 await 걸기 -> 이거 없으면 아래꺼 다같이 비동기적으로 진행해서 connection이 평균 3-4개 생성됨
      // 그 이후부터는 비동기적으로 진행
      await messageBroker.run();
      this.appServer.run();
      this.rpcServer.run();
      this.directServerA.run();
      this.directServerB.run();
      this.groupNotificationServer.run();
      this.myNotificationServer.run();
      this.moonNotificationServer.run();
      system.debug("Application started successfully");
    } catch (error) {
      system.error("Error starting application:", error);
      await this.shutdown();
      throw error;
    }
  }

  async shutdown() {
    system.debug("Shutting down gracefully...");
    try {
      // 역순으로 서비스 종료하기
      if(messageBroker) await messageBroker
      if (this.moonNotificationServer) await this.moonNotificationServer.shutdown();
      if (this.myNotificationServer) await this.myNotificationServer.shutdown();
      if (this.groupNotificationServer) await this.groupNotificationServer.shutdown();
      if (this.directServerB) await this.directServerB.shutdown();
      if (this.directServerA) await this.directServerA.shutdown();
      if (this.rpcServer) await this.rpcServer.shutdown();
      if (this.appServer) await this.appServer.shutdown();

      await new Promise(resolve => setTimeout(resolve, 1000));

      system.debug("Shutdown complete");
      process.exit(0);
    } catch (error) {
      system.error("Error during shutdown:", error);
      process.exit(1);
    }
  }
}

const app = new Application();
app.start().catch(error => {
  system.error("Fatal error:", error);
  process.exit(1);
});