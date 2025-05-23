import express from 'express';
import projectRouter from './src/routes/project.js';
import issueRouter from './src/routes/issue.js';
import userRouter from './src/routes/user.js';
import dotenv from 'dotenv';

dotenv.config();
const PORT = process.env.PORT;

const app = express();

// middle-ware
app.use(express.urlencoded({ extended: false }));

// router
// 해당 라우터에 prefix 적용
app.use('/projects', projectRouter);
app.use('/issues', issueRouter);
app.use('/users', userRouter);

// server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
