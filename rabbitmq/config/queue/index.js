const QueueDefinitions = {
    AUTH_REQUEST_QUEUE: {
        name: 'auth.request.queue',
        options: {
            durable: false,
            autoDelete: true,
            exclusive: true
        }
    },
    // if autoDelete is true, the queue will be deleted when the last consumer unsubscribes
    AUTH_REPLY_QUEUE: {
        name: 'auth.reply.queue',
        options: {
            durable: false,
            autoDelete: false,
            exclusive: true
        }
    },
    NOTIFY_SMS_QUEUE: {
        name: 'notify.sms.queue',
        options: {
            durable: false,
            autoDelete: true,
            exclusive: true,
            arguments: {
                'x-message-ttl': 3000,
                'x-dead-letter-exchange': 'notification.dlx',
                'x-dead-letter-routing-key': 'notify.dlx.sms'
            }
        }
    },
    NOTIFY_EMAIL_QUEUE: {
        name: 'notify.email.queue',
        options: {
            durable: false,
            autoDelete: true,
            exclusive: true,
            arguments: {
                'x-message-ttl': 3000,
                'x-dead-letter-exchange': 'notification.dlx',
                'x-dead-letter-routing-key': 'notify.dlx.email'
            }
        }
    },
    NOTIFY_SLACK_QUEUE: {
        name: 'notify.slack.queue',
        options: {
            durable: false,
            autoDelete: true,
            exclusive: true,
            arguments: {
                'x-message-ttl': 3000,
                'x-dead-letter-exchange': 'notification.dlx',
                'x-dead-letter-routing-key': 'notify.dlx.slack'
            }
        }
    },
    NOTIFY_DLQ: {
        name: 'notify.dlq',
        options: {
            durable: false,
            autoDelete: true,
            exclusive: true
        }
    }
};

module.exports = QueueDefinitions;