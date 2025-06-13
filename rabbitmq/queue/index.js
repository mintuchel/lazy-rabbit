const QueueDefinitions = {
    NOTIFY_SMS_QUEUE: {
        name: 'notify.sms.queue',
        options: {
            durable: false,
            messageTtl: 10000
        }
    },
    NOTIFY_EMAIL_QUEUE: {
        name: 'notify.email.queue',
        options: {
            durable: false,
            messageTtl: 10000
        }
    },
    NOTIFY_SLACK_QUEUE: {
        name: 'notify.slack.queue',
        options: {
            durable: false,
            messageTtl: 10000
        }
    }
};

module.exports = { QueueDefinitions };