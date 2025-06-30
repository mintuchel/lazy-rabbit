const AuthService = require("./auth");
const SMSWorker = require("./notification/sms-worker");
const EmailWorker = require("./notification/email-worker");
const SlackWorker = require("./notification/slack-worker");
const DeadLetterWorker = require('./notification/deadletter-worker');
const MessageBroker = require('../lib');
const system = require("./system");
const WorkerDefinitions = require("./config/rabbitmq/worker");
const ExchangeDefinitions = require('./config/rabbitmq/exchange');
const QueueDefinitions = require('./config/rabbitmq/queue');
const { env } = require('./config');

class Application {

  constructor() {
    this.messageBroker = new MessageBroker(env.MSG_QUEUE_URL, env.HEARTBEAT_INTERVAL_MS);;

    this.authService = null;
    this.smsWorker = null;
    this.emailWorker = null;
    this.slackWorker = null;
    this.deadLetterWorker = null;
  }

  async initChannels() {
    this.authChannel = await this.messageBroker.createChannel();
    this.smsChannel = await this.messageBroker.createChannel();
    this.emailChannel = await this.messageBroker.createChannel();
    this.slackChannel = await this.messageBroker.createChannel();
    this.deadLetterChannel = await this.messageBroker.createChannel();
  }

  async initWorkers() {
    await this.initChannels();

    this.authService = new AuthService(this.authChannel, WorkerDefinitions.AUTH_SERVICE);
    this.smsWorker = new SMSWorker(this.smsChannel, WorkerDefinitions.SMS_WORKER);
    this.emailWorker = new EmailWorker(this.emailChannel, WorkerDefinitions.EMAIL_WORKER);
    this.slackWorker = new SlackWorker(this.slackChannel, WorkerDefinitions.SLACK_WORKER);
    this.deadLetterWorker = new DeadLetterWorker(this.deadLetterChannel, WorkerDefinitions.DEAD_LETTER_WORKER);
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
      // await self.messageBroker.run();
      await self.initWorkers();

      self.authService.run();
      self.smsWorker.run();
      self.emailWorker.run();
      self.slackWorker.run();
      self.deadLetterWorker.run();
      system.debug("Application started successfully");
    } catch (error) {
      system.error("Error starting application:", error);
      await self.shutdown();
      throw error;
    }

    self.channel = await self.messageBroker.createChannel();

    setInterval(async () => {
      const result = await self.messageBroker.publishRpcMessage(
        self.channel,
        ExchangeDefinitions.AUTH_EXCHANGE,
        QueueDefinitions.AUTH_REPLY_QUEUE,
        'auth.login',
        {
          username: 'lazy_rabbit',
          password: 'iwantcoconut!'
        }
      );
      system.info("[APPLICATION] RECIEVED :", result);
    }, 2000);
  }

  async shutdown() {
    system.debug("Shutting down gracefully...");

    try {
      if (this.deadLetterWorker) await this.deadLetterWorker.shutdown();
      if (this.smsWorker) await this.smsWorker.shutdown();
      if (this.emailWorker) await this.emailWorker.shutdown();
      if (this.slackWorker) await this.slackWorker.shutdown();
      if (this.authService) await this.authService.shutdown();
      if (this.messageBroker) await this.messageBroker.shutdown();

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