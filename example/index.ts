import { AuthService } from "./auth";
import { SMSWorker } from "./notification/sms-worker";
import { EmailWorker } from "./notification/email-worker";
import { SlackWorker } from "./notification/slack-worker";
import { DeadLetterWorker } from './notification/deadletter-worker';
import { messageBroker } from "./lib/message-broker";
import { system } from "./system";
import { WorkerDefinitions } from "./config/rabbitmq/worker";
import { ExchangeDefinitions } from './config/rabbitmq/exchange';
import { QueueDefinitions } from './config/rabbitmq/queue';
import { Channel } from 'amqplib';

class Application {

    private messageBroker: any;
    private authService: AuthService | null = null;
    private smsWorker: SMSWorker | null = null;
    private emailWorker: EmailWorker | null = null;
    private slackWorker: SlackWorker | null = null;
    private deadLetterWorker: DeadLetterWorker | null = null;
    private authChannel: Channel | null = null;
    private smsChannel: Channel | null = null;
    private emailChannel: Channel | null = null;
    private slackChannel: Channel | null = null;
    private deadLetterChannel: Channel | null = null;
    private channel: Channel | null = null;

    constructor() {
        this.messageBroker = messageBroker;
    }

    async initChannels(): Promise<void> {
        this.authChannel = await this.messageBroker.createChannel();
        this.smsChannel = await this.messageBroker.createChannel();
        this.emailChannel = await this.messageBroker.createChannel();
        this.slackChannel = await this.messageBroker.createChannel();
        this.deadLetterChannel = await this.messageBroker.createChannel();
    }

    async initWorkers(): Promise<void> {
        await this.initChannels();

        if (this.authChannel) {
            this.authService = new AuthService(this.authChannel, WorkerDefinitions.AUTH_SERVICE);
        }
        if (this.smsChannel) {
            this.smsWorker = new SMSWorker(this.smsChannel, WorkerDefinitions.SMS_WORKER);
        }
        if (this.emailChannel) {
            this.emailWorker = new EmailWorker(this.emailChannel, WorkerDefinitions.EMAIL_WORKER);
        }
        if (this.slackChannel) {
            this.slackWorker = new SlackWorker(this.slackChannel, WorkerDefinitions.SLACK_WORKER);
        }
        if (this.deadLetterChannel) {
            this.deadLetterWorker = new DeadLetterWorker(this.deadLetterChannel, WorkerDefinitions.DEAD_LETTER_WORKER);
        }
    }

    async start(): Promise<void> {
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

            if (self.authService) self.authService.run();
            if (self.smsWorker) self.smsWorker.run();
            if (self.emailWorker) self.emailWorker.run();
            if (self.slackWorker) self.slackWorker.run();
            if (self.deadLetterWorker) self.deadLetterWorker.run();
            system.debug("Application started successfully");
        } catch (error) {
            system.error("Error starting application:", error);
            await self.shutdown();
            throw error;
        }

        self.channel = await self.messageBroker.createChannel();

        setInterval(async () => {
            if (self.channel) {
                const response = await self.messageBroker.publishRpcMessage(
                    self.channel,
                    ExchangeDefinitions.AUTH_EXCHANGE,
                    QueueDefinitions.AUTH_REPLY_QUEUE,
                    'auth.login',
                    {
                        username: 'lazy_rabbit',
                        password: 'iwantcoconut!'
                    }
                );
                const msg = JSON.parse(response.content.toString());
                system.info("[APPLICATION] RECIEVED :", msg);
            }
        }, 2000);
    }

    async shutdown(): Promise<void> {
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