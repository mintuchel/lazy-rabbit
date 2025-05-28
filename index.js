import { AppServer } from "./app-server/server.js";
import { RpcServer } from "./rpc-server/server.js";
import { DirectServer } from "./direct-server/server.js";

async function main() {
  const appServer = new AppServer();
  await appServer.run();

  const rpcServer = new RpcServer();
  rpcServer.run();

  const directServer = new DirectServer();
  directServer.run();
}

main();