import { AppServer } from "./app-server/server.js";
import { RpcServer } from "./rpc-server/server.js";
import { DirectServer } from "./direct-server/server.js";
import { NotificationServer } from "./notification-server/server.js";
import { QueueDefinitions } from "./rabbitmq/queue/index.js";
import { ExchangeDefinitions } from "./rabbitmq/exchange/index.js";

async function main() {
  const appServer = new AppServer();
  await appServer.run();

  const rpcServer = new RpcServer(QueueDefinitions.RPC_QUEUE);
  rpcServer.run();

  const directServerA = new DirectServer(ExchangeDefinitions.DIRECT_EXCHANGE, 'A', (msg) => {
    console.log("[ DirectServer A] RECIEVED:", msg.content.toString());
  });
  directServerA.run();

  const directServerB = new DirectServer(ExchangeDefinitions.DIRECT_EXCHANGE, 'B', (msg) => {
    console.log("[ DirectServer B] RECIEVED:", msg.content.toString());
  });
  directServerB.run();

  const groupNotificationServer = new NotificationServer(ExchangeDefinitions.NOTIFICATION_EXCHANGE, 'echoit.*', (msg) => {
    console.log("[ GroupNotificationServer ] RECIEVED:", msg.content.toString());
  });
  groupNotificationServer.run();

  const myNotificationServer = new NotificationServer(ExchangeDefinitions.NOTIFICATION_EXCHANGE, 'echoit.mjh', (msg) => {
    console.log("[ MeNotificationServer ] RECIEVED:", msg.content.toString());
  });
  myNotificationServer.run();
}

main();