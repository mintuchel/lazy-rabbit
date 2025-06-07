const express = require('express');
const accountRouter = require('./routes/account.routes');
const rpcRouter = require('./routes/rpc.routes');
const directRouter = require('./routes/direct.routes');
const notificationRouter = require('./routes/notification.routes');

const { env } = require('../config');

class AppServer {
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

        this.server = this.app.listen(this.port, () => {
            console.log("[AppServer] express-app running on port %s", this.port);
        });
    }

    async shutdown() {
        if (this.server) {
            return new Promise((resolve, reject) => {
                // 서버 인스턴스 반환
                this.server.close((err) => {
                    if (err) {
                        console.error("[AppServer] Error during shutdown:", err);
                        reject(err);
                    } else {
                        console.log("[AppServer] Server closed successfully");
                        resolve();
                    }
                });
            });
        }
    }
}

module.exports = { AppServer };