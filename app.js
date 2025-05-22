import express from 'express';
import projectRouter from './src/routes/project.js';

const app = express();
const PORT = 8080;

// middle-ware
app.use(express.urlencoded({ extended: false }));

// router
app.use('/projects', projectRouter); // 해당 라우터에 prefix 적용

// server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
