import express from 'express';
import dbRouter from './routes/db.routes.js';
import rpcRouter from './routes/rpc.routes.js';
import directRouter from './routes/direct.routes.js';

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
        this.app.use('/issues', dbRouter);
        this.app.use('/notification', rpcRouter);
        this.app.use('/direct', directRouter);
    }

    async run() {
        this.initMiddleware();
        this.initRoutes();

        this.app.listen(this.port, () => {
            console.log("[AppServer] express-app running on port %s", this.port);
        })
    }
}