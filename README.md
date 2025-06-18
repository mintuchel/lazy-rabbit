# lazy-rabbit

<p align="center">
  <img src="https://github.com/user-attachments/assets/d010b754-a3fb-4fb0-906e-8dd1adfee401" width="200" />
</p>

A lightweight wrapper around [amqplib](https://www.npmjs.com/package/amqplib) for [RabbitMQ](https://www.rabbitmq.com/docs) that simplifies configuration and message workflows for publishing and consuming - _allowing you to be lazy_

## Introduction

While the amqplib library offers a great deal of control and flexibility by exposing low-level AMQP concepts directly, it does not provide high-level abstractions for easier configuration — such as those typically found in frameworks. As a result, it’s entirely up to the developer to establish appropriate messaging patterns and configuration strategies.

To address this, lazy-rabbit introduces lightweight wrapper functions around common amqplib publishing and subscribing patterns. With these wrappers, you can send and receive messages more easily by simply providing configuration objects along with routing information (such as routingKey, bindingKey, etc.). The internal logic takes care of interpreting and applying these settings appropriately.

In addition, the base Worker class offers a simple way to build custom consumers through inheritance. Define the exchange, queue, and binding key using the provided schema, then register routing key–specific callbacks using dynamic handler registration —no additional setup required.

## Features

lazy-rabbit seeks to either solve these problems, making them easier to deal with by adding the following to amqlib.

### 1. Configuration-Driven Messaging Architecture

Define exchanges, queues, and workers (consumers) using a simple, predefined configuration schema. This structured approach eliminates the need for hardcoded setup logic and option settings, making your messaging topology easy to modify and maintain.

Its the best practice to centralize the configurations. By centralizing these definitions in one place, you can avoid scattering hardcoded setup logic and option settings throughout your codebase. Whether you manage configurations via the config library, JSON files, or arrays, the choice is yours.

### 2. Automated Exchange/Queue Declaration & Binding

When publishing or consuming messages, exchanges and queues are automatically declared (creates anonymous ones if not specified) and bound according to the configuration. You don’t need to manually call assertExchange, assertQueue, or bindQueue - just use the built-in publish or subscribe methods, and the system will handle the rest. This reduces boilerplate and keeps your messaging topology consistent and always up-to-date.

### 3. Build Message Consumers by Extending the Base Worker

The base Worker class provides a structured foundation for creating message consumers. By extending it, you can easily define the exchange, queue to listen to specific messages. Routing key-based handler registration is supported, allowing a single worker to dynamically process multiple tasks. Simply inherit, configure and register handlers - no boilerplate required.

### 4. Dynamic Handler Registration & RoutingKey-Based Dispatch

For heavy-weight tasks, it’s often best to assign a dedicated Worker with a single callback to ensure isolation and performance. However, this approach can become inefficient for lightweight tasks. To address this, the Worker class includes a built-in dispatch mechanism that dynamically routes messages to the appropriate handler based on their routing key—allowing a single Worker to flexibly manage multiple lightweight operations without unnecessary duplication.

In this structure, you can scale-out easily when workload increases beyond what a single Worker can handle.

### 4. Built-in RPC Pattern Support

Seamlessly implement RPC communication patterns with built-in methods for request/reply messaging. Features include temporary reply queues, correlation IDs, timeouts, and automatic response handling.

### 5. Connection & Channel Management

Connections and channels are managed internally, with automatic creation and reuse. Each worker can operate on its own channel, supporting isolation and concurrency.

## Configuration Schemas

### 1. Exchange Configuration Schema

```javascript
NOTIFICATION_EXCHANGE: {
    name: 'avocado.notification.exchange',
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
NOTIFY_SMS_QUEUE: {
    name: 'notify.sms.queue',
    options: {
        durable: false,
        messageTtl: 10000
    }
}
```

- name: Name of the queue
- options: Queue-specific settings such as durable, messageTtl, deadLetterExchange, etc

### 3. Worker Schema

```javascript
EMAIL_NOTIFICATION_WORKER: {
    name: 'email-notification',
    exchangeDefinition: ExchangeDefinitions.NOTIFICATION_EXCHANGE,
    queueDefinition: QueueDefinitions.NOTIFY_EMAIL_QUEUE,
    bindingKey: 'notify.email.#'
}
```

The specified queue is bound to the given exchange using the provided bindingKey pattern for routing incoming messages.

- exchangeDefinition: Exchange schema worker listens to
- queueDefinition: Queue schema this worker consumes from. if left blank, anonymous queue is used automatically.
- bindingKey: The routing key pattern used for message filtering

## Roadmap

- Improve TypeScript support
- Support delayed message queues
- Add retry mechanism for message consumption
- Error Handling
- Support multi-channel usage per Worker based on purpose (currently, each Worker is limited to a single channel)
