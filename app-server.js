import express from 'express';
import issueRouter from './src/routes/issue.routes.js';
import notificationRouter from './src/routes/notification.routes.js';
import { env } from './src/config/index.js';

export class AppServer {
    constructor() {
        this.app = express();
        this.port = env.PORT;
    }

    initMiddleware() {
        this.app.use(express.urlencoded({ extended: false }));
        this.app.use(express.json());
    }

    initRoutes() {
        this.app.use('/issues', issueRouter);
        this.app.use('/notification', notificationRouter);
    }

    async run() {
        this.initMiddleware();
        this.initRoutes();

        this.app.listen(this.port, () => {
            console.log("[AppServer] express-app running on port %s", this.port);
        })
    }
}