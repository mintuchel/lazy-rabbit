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
            autoDelete: false,
            exclusive: true
        }
    },
    NOTIFICATION_SMS_QUEUE: {
        name: 'notification.sms.queue',
        options: {
            durable: false,
            autoDelete: true,
            exclusive: true,
            arguments: {
                'x-message-ttl': 3000,
                'x-dead-letter-exchange': 'dlx.notification.exchange',
                'x-dead-letter-routing-key': 'notification.sms.dlq'
            }
        }
    },
    NOTIFICATION_EMAIL_QUEUE: {
        name: 'notification.email.queue',
        options: {
            durable: false,
            autoDelete: true,
            exclusive: true,
            arguments: {
                'x-message-ttl': 3000,
                'x-dead-letter-exchange': 'dlx.notification.exchange',
                'x-dead-letter-routing-key': 'notification.email.dlq'
            }
        }
    },
    NOTIFICATION_SLACK_QUEUE: {
        name: 'notification.slack.queue',
        options: {
            durable: false,
            autoDelete: true,
            exclusive: true,
            arguments: {
                'x-message-ttl': 3000,
                'x-dead-letter-exchange': 'dlx.notification.exchange',
                'x-dead-letter-routing-key': 'notification.slack.dlq'
            }
        }
    },
    NOTIFICATION_DLQ: {
        name: 'notification.queue.dlq',
        options: {
            durable: false,
            autoDelete: true,
            exclusive: true
        }
    }
};

module.exports = QueueDefinitions;