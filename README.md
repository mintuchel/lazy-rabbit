# lazy-rabbit

<p align="center">
  <img src="https://github.com/user-attachments/assets/d010b754-a3fb-4fb0-906e-8dd1adfee401" width="200" />
</p>

A lightweight wrapper around [amqplib](https://www.npmjs.com/package/amqplib) for working with [RabbitMQ](https://www.rabbitmq.com/docs) that simplifies configuration and message workflows for publishing and consuming, enabling producer-consumer oriented development - _allowing you to be lazy_

## Introduction

While the amqplib library offers a great deal of control and flexibility by exposing low-level AMQP concepts directly, it does not provide high-level abstractions for easier configuration — such as those typically found in frameworks. As a result, it’s entirely up to the developer to establish appropriate messaging patterns and configuration strategies.

To address this, lazy-rabbit introduces lightweight wrapper functions around common amqplib publishing and subscribing patterns. With these wrappers, you can send and receive messages more easily by simply providing configuration objects along with routing information (such as routingKey, bindingKey, etc.). The internal logic takes care of interpreting and applying these settings appropriately.

In addition, a base worker class is included. The Worker comes with an internal handlerMap and message dispatcher, allowing you to register callback functions for specific routingKeys. When a message arrives, the appropriate handler is automatically invoked based on the routing key.

## Features

lazy-rabbit seeks to either solve these problems, making them easier to deal with by adding the following to amqlib.

### 1. Configuration-Driven Messaging Architecture

Define exchanges, queues, and workers (consumers) using a simple, predefined [configuration schemas](#configuration-schemas). This structured approach eliminates the need for hardcoded setup logic and option settings, making your messaging topology easy to modify and maintain.

### 2. Automated Exchange/Queue Declaration & Binding

When publishing or consuming messages, exchanges and queues are automatically declared (creates anonymous ones if not specified) and bound according to the configuration. You don’t need to manually call assertExchange, assertQueue, or bindQueue - just use the built-in publish or subscribe methods, and the system will handle the rest. This reduces boilerplate and keeps your messaging topology consistent and always up-to-date.

### 3. Enables Producer-Consumer Oriented Development

It’s a best practice to centralize your message broker architecture configuration. By defining exchanges, queues, and routing logic in one place, you can avoid scattering hardcoded setup logic and amqp options across your codebase.

This design allows you to focus purely on **producer** and **consumer** logic — without worrying about the low-level plumbing. Whether you manage configurations via a config library, JSON files, or simple objects, the choice is yours.

### 4. Build Message Consumers by Extending the Base Worker

The base Worker class provides a structured foundation for creating message consumers. By extending it, you can easily define the exchange, queue to listen to specific messages. Routing key-based handler registration is supported, allowing a single worker to dynamically process multiple tasks. Simply inherit, configure and register handlers - _no boilerplate required_.

### 5. Dynamic Handler Registration & RoutingKey-Based Dispatch

For heavy-weight tasks, it’s often best to assign a dedicated Worker with a single callback to ensure isolation and performance. However, this approach can become inefficient for lightweight tasks. To address this, the Worker class includes a built-in dispatch mechanism that dynamically routes messages to the appropriate handler based on their routing key—allowing a single Worker to flexibly manage multiple lightweight operations without unnecessary duplication.

In this structure, you can scale-out easily when workload increases beyond what a single Worker can handle. Therefore, you can attach additional Worker instances to the same queue to parallelize message processing and offload pressure from a single worker—enabling scalable, load-balanced execution as demand grows.

### 6. Built-in RPC Pattern Support

Seamlessly implement RPC communication patterns with built-in methods for request/reply messaging. Features include temporary reply queues, correlation IDs, timeouts, and automatic response handling.

### 7. Simple Dead-Letter Pipeline Setup

Dead-Lettering is effectively **just another form of message consumption** - the only difference is that you don’t manually define the publisher. In this case, the **original queue acts as the publisher** for dead-lettered messages, automatically forwarding them to the configured Dead-Letter Exchange(DLX).

With lazy-rabbit, subscribing to DLX messages is no different from regular consumers. Just bind your DLX to the appropriate queue and routing key using subscribeToExchange, and handle the messages as usual - by your callback function called by dispatch method.

## Configuration Schemas

### 1. Exchange Schema

```javascript
NOTIFICATION_EXCHANGE: {
    name: 'demo.notification.exchange',
    type: 'topic',
    options: {
        durable: false,
        autoDelete: true,
        internal: false
    }
}
```

- name: Name of the exchange
- type: Exchange type — supports 'direct', 'topic', 'fanout', or 'headers'
- options: Additional settings such as durable, autoDelete, etc

### 2. Queue Schema

```javascript
NOTIFICATION_SMS_QUEUE: {
    name: 'notification.sms.queue',
    options: {
        durable: true,
        exclusive: true,
        arguments: {
            'x-message-ttl': 30000,
            'x-dead-letter-exchange': 'dlx.notification.exchange',
            'x-dead-letter-routing-key': 'dlx.notification.sms',
        }
    }
}
```

- name: Name of the queue
- options: options: Standard AMQP queue settings such as durability, exclusivity and advance queue features like dead-lettering and messageTTL via arguments.

### 3. Worker Schema

```javascript
EMAIL_NOTIFICATION_WORKER: {
    name: 'email-notification',
    exchangeDefinition: ExchangeDefinitions.NOTIFICATION_EXCHANGE,
    queueDefinition: QueueDefinitions.NOTIFY_EMAIL_QUEUE,
    bindingKey: BindingKeys.EMAIL_WORKER_BK
}
```

The specified queue is bound to the given exchange using the provided bindingKey pattern for routing incoming messages.

- exchangeDefinition: Exchange schema worker listens to
- queueDefinition: Queue schema this worker consumes from. if left blank, anonymous queue is used automatically.
- bindingKey: The routing key pattern used for message filtering

## Caveats

1. A single AMQP connection is reused internally, and each worker maintains its own dedicated channel.
2. All messages are expected to be in JSON format.
3. The full amqplib.Message is passed to the dispatch method. lazy-rabbit does not automatically parse msg.content - you must handle it by yourself
4. ACK/NACK behavior is fully controlled inside your dispatch function. The first argument passed to the handler is the channel, giving you full control to acknowledge(channel.ack) or reject(channel.nack) the message based on your business logic. You can also use the channel to perform message chaining or implement RPC-style flows using the messageBroker’s built-in publish/subscribe helpers.
5. By default, `nack:false` is used - messages will not be requeued unless explicitly handled inside dispatch function.

## Getting Started with Demo App

A minimal demo app is included under the `example/` directory.

It demonstrates how to use the library with key features such as:

- Direct message publishing
- RPC messaging
- Dynamic handler registration in worker consumers
- Dead-letter exchange (DLX) configuration
- Random error generation in workers

```bash
npm install
npm start
```

You'll need a RabbitMQ server running locally with default configuration.

The diagram below illustrates the current message broker architecture used in demo app, focused on message delivery and communication flow.

![Demo-Architecture](https://github.com/user-attachments/assets/c82e3df3-e2ff-4439-9057-f569c6b3134c)

This example omits actual authentication and notification handling or full signup CRUD logic. The focus is solely on inter-service messaging.

## Roadmap

- [ ] Migrate codebase to TypeScript
- [ ] Automatically re-connect, re-subscribe, or retry publishing
- [ ] Add retry mechanism for message consumption
- [x] Support x-dead-letter-exchange advanced option when publishing to exchange
- [ ] Error Handling (think this will take long since amqp doesnt support error codes. they are emitting errors by pure string...)
- [ ] Support multi-channel usage per Worker based on purpose (currently, each Worker is limited to a single channel)
- [x] Allow users to handle ack/nack explicitly within their own handlers for flexible success/failure message processing
