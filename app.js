import express from 'express';
import { env } from './config/env.js';
import issueRouter from './routes/issueRouter.js';
import userRouter from './routes/userRouter.js';

const app = express();

// Middleware
app.use(express.json()); // JSON 요청 본문 파싱
app.use(express.urlencoded({ extended: false })); // URL-encoded 데이터 파싱

// Router
app.use('/issues', issueRouter);
app.use('/users', userRouter);

// Server
app.listen(env.PORT, () => {
  console.log(`Server running at http://localhost:${env.PORT}`);
});

export default app;