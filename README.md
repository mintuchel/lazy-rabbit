# lazy-rabbit

<div style="text-align: center;">
  <img src="https://github.com/user-attachments/assets/d010b754-a3fb-4fb0-906e-8dd1adfee401" width="200" />
</div>

A lightweight wrapper around [amqplib](https://www.npmjs.com/package/amqplib) for [RabbitMQ](https://www.rabbitmq.com/docs) that simplifies configuration and message workflows for publishing and consuming - _allowing you to be lazy_

## Introduction

While the amqplib library offers a great deal of control and flexibility by exposing low-level AMQP concepts directly, it does not provide high-level abstractions for easier configuration — such as those typically found in frameworks. As a result, it’s entirely up to the developer to establish appropriate messaging patterns and configuration strategies.

To address this, lazy-rabbit introduces lightweight wrapper functions around common amqplib publishing and subscribing patterns. With these wrappers, you can send and receive messages more easily by simply providing configuration objects along with routing information (such as routingKey, bindingKey, etc.). The internal logic takes care of interpreting and applying these settings appropriately.

In addition, a base worker class is included. The Worker comes with an internal handlerMap and message dispatcher, allowing you to register callback functions for specific routingKeys. When a message arrives, the appropriate handler is automatically invoked based on the routing key.

## Features

lazy-rabbit seeks to either solve these problems, making them easier to deal with by adding the following to amqlib.

### 1. Configuration-Driven Messaging Architecture

Define exchanges, queues, and workers (consumers) through configuration files. This enables scalable and maintainable message infrastructure without hardcoding logic and option settings, making it easy to extend or modify your messaging topology.

### 2. Automated Exchange/Queue Declaration & Binding

Exchanges and queues are automatically asserted (create anonymous if missing) and bound as needed when publishing or consuming messages. This reduces boilerplate and ensures your messaging topology is always up-to-date.

### 3. **Configurable and Reusable Worker Base Class**

A reusable Worker base class is provided, allowing you to register routing key–based handlers. With simple configuration for queues, exchanges, and bindings, you can quickly build message consumers.

### 4. Dynamic Handler Registration & RoutingKey-Based Dispatch

Workers can register multiple handlers for different routing keys. Incoming messages are dynamically dispatched to the appropriate handler based on their routing key, supporting flexible and modular message processing.

If a message arrives for an unregistered routing key, a notfound event is emitted. Handler errors are also surfaced via events, making it easy to log and monitor unexpected issues.

### 4. Built-in RPC Pattern Support

Seamlessly implement RPC communication patterns with built-in methods for request/reply messaging. Features include temporary reply queues, correlation IDs, timeouts, and automatic response handling.

### 5. Connection & Channel Management

Connections and channels are managed internally, with automatic creation and reuse. Each worker can operate on its own channel, supporting isolation and concurrency.

### 5. Event-Driven Status & Error Reporting

The broker emits events for key lifecycle moments—such as connection success, errors, timeouts, and disconnects—enabling robust monitoring and custom error handling via Node.js’s EventEmitter.

### 7. Graceful Shutdown for Workers & Broker

Both workers and the broker provide methods for cleanly shutting down channels and connections, supporting safe application restarts and deployments.

## Configuration Schemas

### 1. Exchange Configuration Schema

### 2. Queue Schema

### 3. Worker Schema

## Roadmap

- Improve TypeScript support
- Support delayed message queues
- Add retry mechanism for message consumption
- Error Handling
