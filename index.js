import { AppServer } from "./app-server.js";
import { NotificationServer } from './src/notification-server/server.js';

async function main() {
  const appServer = new AppServer();
  await appServer.run();

  const notificationServer = new NotificationServer();
  
  // run 하면 실행될 콜백함수
  // 비즈니스로직이 여기 들어감
  notificationServer.run(async function (messagePayload) {
    console.log('Received message:', messagePayload);
    return {
      success: true,
      message: "this is response msg by server!"
    };
  });
}

main();