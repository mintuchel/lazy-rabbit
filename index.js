import express from 'express';
import issueRouter from './src/routes/issue.routes.js';
import notificationRouter from './src/routes/notification.routes.js';
import { env } from './src/config/index.js';

const PORT = env.PORT;

const app = express();

// middle-ware
app.use(express.urlencoded({ extended: false }));

// router
// 해당 라우터에 prefix 적용
app.use('/issues', issueRouter);
app.use('/notification', notificationRouter);

// server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});