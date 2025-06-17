const RpcWorker = require("./rpc-worker");
const AppServer = require("./app-server/server");
const { env } = require('./config');
const WorkerA = require("./direct-worker/workerA");
const WorkerB = require("./direct-worker/workerB");
const SMSWorker = require("./notification/sms-worker");
const EmailWorker = require("./notification/email-worker");
const SlackWorker = require("./notification/slack-worker");
const system = require("./system");
const messageBroker = require("./rabbitmq");
const Logger = require("./logger");

class Application {
  constructor() {
    this.appServer = new AppServer();
    this.rpcWorker = new RpcWorker();
    this.workerA = new WorkerA();
    this.workerB = new WorkerB();
    this.smsWorker = new SMSWorker();
    this.emailWorker = new EmailWorker();
    this.slackWorker = new SlackWorker();
    this.logger = new Logger();
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
      this.workerA.run();
      this.workerB.run();
      this.smsWorker.run();
      this.emailWorker.run();
      this.slackWorker.run();
      this.logger.run();
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
      if (this.logger) await this.logger.shutdown();
      if (this.smsWorker) await this.smsWorker.shutdown();
      if (this.emailWorker) await this.emailWorker.shutdown();
      if (this.slackWorker) await this.slackWorker.shutdown();
      if (this.workerB) await this.workerB.shutdown();
      if (this.workerA) await this.workerA.shutdown();
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