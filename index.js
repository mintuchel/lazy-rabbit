import { AppServer } from "./app-server/server.js";
import { RpcServer } from "./rpc-server/server.js";
import { DirectServer } from "./direct-server/server.js";
import { QueueDefinitions } from "./rabbitmq/queue/index.js";
import { ExchangeDefinitions } from "./rabbitmq/exchange/index.js";

async function main() {
  const appServer = new AppServer();
  await appServer.run();

  const rpcServer = new RpcServer(QueueDefinitions.RPC_QUEUE);
  rpcServer.run();

  const directServer = new DirectServer(ExchangeDefinitions.DIRECT_EXCHANGE);
  directServer.run();
}

main();