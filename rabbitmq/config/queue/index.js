const QueueDefinitions = {
    AUTH_REQUEST_QUEUE: {
        name: 'auth.request.queue',
        options: {
            durable: false,
            autoDelete: true,
            exclusive: true
        }
    },
    AUTH_REPLY_QUEUE: {
        name: 'auth.reply.queue',
        options: {
            durable: false,
            autoDelete: true,
            exclusive: true
        }
    },
    NOTIFY_SMS_QUEUE: {
        name: 'notify.sms.queue',
        options: {
            durable: false,
            autoDelete: true,
            exclusive: true
        }
    },
    NOTIFY_EMAIL_QUEUE: {
        name: 'notify.email.queue',
        options: {
            durable: false,
            autoDelete: true,
            exclusive: true
        }
    },
    NOTIFY_SLACK_QUEUE: {
        name: 'notify.slack.queue',
        options: {
            durable: false,
            autoDelete: true,
            exclusive: true
        }
    }
};

module.exports = QueueDefinitions;