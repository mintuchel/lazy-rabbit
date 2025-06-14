const { AppServer } = require("./app-server/server");
const { RpcWorker } = require("./rpc-worker");
const { DirectServer } = require("./direct-server/server");
const { NotificationWorker } = require("./notification-worker/worker");
const { ExchangeDefinitions } = require("./rabbitmq/exchange");
const { QueueDefinitions } = require("./rabbitmq/queue");
const { messageBroker } = require("./rabbitmq");

const system = require("./system");

class Application {
  constructor() {
    this.appServer = new AppServer();
    this.rpcWorker = new RpcWorker(ExchangeDefinitions.RPC_EXCHANGE);
    this.directServerA = new DirectServer(ExchangeDefinitions.DIRECT_EXCHANGE, "", 'A', (msg) => {
      system.info("[RECIEVED] DirectServer A:", msg.content.toString());
    });
    this.directServerB = new DirectServer(ExchangeDefinitions.DIRECT_EXCHANGE, "", 'B', (msg) => {
      system.info("[RECIEVED] DirectServer B:", msg.content.toString());
    });

    this.smsWorker = new NotificationWorker(ExchangeDefinitions.NOTIFICATION_EXCHANGE, QueueDefinitions.NOTIFY_SMS_QUEUE, 'notify.sms.#', (msg) => {
      system.info("[RECIEVED] Worker (SMS):", msg.content.toString());
    });

    this.emailWorker = new NotificationWorker(ExchangeDefinitions.NOTIFICATION_EXCHANGE, QueueDefinitions.NOTIFY_EMAIL_QUEUE, 'notify.email.#', (msg) => {
      system.info("[RECIEVED] Worker (EMAIL):", msg.content.toString());
    });

    this.slackWorker = new NotificationWorker(ExchangeDefinitions.NOTIFICATION_EXCHANGE, QueueDefinitions.NOTIFY_SLACK_QUEUE, 'notify.slack.#', (msg) => {
      system.info("[RECIEVED] Worker (SLACK):", msg.content.toString());
    });
  }

  async start() {
    system.debug('Starting application...');

    const self = this;

    // HANG-UP
    process.on("SIGHUP", () => {
      system.error('sig-hangup called');
      self.shutdown();
    });

    // INTERRUPT
    process.on("SIGINT", () => {
      system.error('sig-interrupt called');
      self.shutdown();
    });

    // TERMINATE
    process.on("SIGTERM", () => {
      system.error('sig-term called');
      self.shutdown();
    });

    try {
      // connection 하나만 생성되게 하기 위해 messageBroker.run 에 await 걸기 -> 이거 없으면 아래꺼 다같이 비동기적으로 진행해서 connection이 평균 3-4개 생성됨
      // 그 이후부터는 비동기적으로 진행
      await messageBroker.run();
      
      this.appServer.run();
      this.rpcWorker.run();
      this.directServerA.run();
      this.directServerB.run();
      this.smsWorker.run();
      this.emailWorker.run();
      this.slackWorker.run();
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
      if (this.smsWorker) await this.smsWorker.shutdown();
      if (this.emailWorker) await this.emailWorker.shutdown();
      if (this.slackWorker) await this.slackWorker.shutdown();
      if (this.directServerB) await this.directServerB.shutdown();
      if (this.directServerA) await this.directServerA.shutdown();
      if (this.rpcWorker) await this.rpcWorker.shutdown();
      if (this.appServer) await this.appServer.shutdown();
      if (messageBroker) messageBroker.shutdown();

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