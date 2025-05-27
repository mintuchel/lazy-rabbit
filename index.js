import { AppServer } from "./app-server.js";
import { NotificationServer } from './src/notification-server/server.js';
import { SchedulerServer} from "./src/scheduler-server/server.js";

async function main() {
  const appServer = new AppServer();
  await appServer.run();

  const notificationServer = new NotificationServer();
  notificationServer.run();

  const schedulerServer = new SchedulerServer();
  schedulerServer.run();
}

main();