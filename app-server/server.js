import express from 'express';
import accountRouter from './routes/account.routes.js';
import rpcRouter from './routes/rpc.routes.js';
import directRouter from './routes/direct.routes.js';
import notificationRouter from './routes/notification.routes.js';

import { env } from '../config/index.js';

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
        this.app.use('/account', accountRouter);
        this.app.use('/rpc', rpcRouter);
        this.app.use('/direct', directRouter);
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