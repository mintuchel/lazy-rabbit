const { env } = require('./config');
const AuthService = require("./auth");
const SMSWorker = require("./notification/sms-worker");
const EmailWorker = require("./notification/email-worker");
const SlackWorker = require("./notification/slack-worker");
const system = require("./system");
const messageBroker = require("./rabbitmq");
const ExchangeDefinitions = require('./rabbitmq/config/exchange');
const QueueDefinitions = require('./rabbitmq/config/queue');

class Application {
  constructor() {
    this.channel = null;
    this.authService = new AuthService();
    this.smsWorker = new SMSWorker();
    this.emailWorker = new EmailWorker();
    this.slackWorker = new SlackWorker();
  }

  async start() {
    system.debug('Starting application...');

    // 콜백이나 내부 함수에서 외부 this를 안전하게 참조하기 위한 우회 방식
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

      self.authService.run();
      self.smsWorker.run();
      self.emailWorker.run();
      self.slackWorker.run();
      system.debug("Application started successfully");
    } catch (error) {
      system.error("Error starting application:", error);
      await self.shutdown();
      throw error;
    }

    self.channel = await messageBroker.createChannel();

    setInterval(() => {
      messageBroker.publishRpcMessage(
        self.channel,
        ExchangeDefinitions.AUTH_EXCHANGE,
        QueueDefinitions.AUTH_REPLY_QUEUE,
        'auth.login',
        {
          username: 'lazy_rabbit',
          password: 'iwantcoconut!'
        }
      );

      // messageBroker.publishRpcMessage(
      //   self.channel,
      //   ExchangeDefinitions.AUTH_EXCHANGE,
      //   QueueDefinitions.AUTH_REPLY_QUEUE,
      //   'auth.signup',
      //   {
      //     username: 'lazy_rabbit',
      //     password: 'iwantcoconut!',
      //     sex: 'male',
      //     age: '26'
      //   }
      // );
    }, 2000);
  }

  async shutdown() {
    system.debug("Shutting down gracefully...");

    try {
      // 역순으로 서비스 종료하기
      if (this.smsWorker) await this.smsWorker.shutdown();
      if (this.emailWorker) await this.emailWorker.shutdown();
      if (this.slackWorker) await this.slackWorker.shutdown();
      if (this.authService) await this.authService.shutdown();
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