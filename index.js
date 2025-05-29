import { AppServer } from "./app-server/server.js";
import { RpcServer } from "./rpc-server/server.js";
import { DirectServer } from "./direct-server/server.js";
import { TopicServer } from "./topic-server/server.js";
import { QueueDefinitions } from "./rabbitmq/queue/index.js";
import { ExchangeDefinitions } from "./rabbitmq/exchange/index.js";

async function main() {
  const appServer = new AppServer();
  await appServer.run();

  const rpcServer = new RpcServer(QueueDefinitions.RPC_QUEUE);
  rpcServer.run();

  const directServerA = new DirectServer(ExchangeDefinitions.DIRECT_EXCHANGE, 'A');
  directServerA.run();

  const directServerB = new DirectServer(ExchangeDefinitions.DIRECT_EXCHANGE, 'B');
  directServerB.run();

  const topicServer1 = new TopicServer(ExchangeDefinitions.TOPIC_EXCHANGE, '*.*.rabbit');
  topicServer1.run();

  const topicServer2 = new TopicServer(ExchangeDefinitions.TOPIC_EXCHANGE, '*.orange.*');
  topicServer2.run();
}

main();