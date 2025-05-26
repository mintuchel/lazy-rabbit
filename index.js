import express from 'express';
import issueRouter from './src/routes/issue.routes.js';
import notificationRouter from './src/routes/notification.routes.js';
import { env } from './src/config/index.js';
import { NotificationServer } from './src/notification-server/server.js';

const PORT = env.PORT;

const app = express();

// middle-ware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// router
// 해당 라우터에 prefix 적용
app.use('/issues', issueRouter);
app.use('/notification', notificationRouter);

// server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

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