const express = require('express');
const accountRouter = require('./routes/account.routes');
const rpcRouter = require('./routes/rpc.routes');
const directRouter = require('./routes/direct.routes');
const notificationRouter = require('./routes/notification.routes');
const system = require("../system");

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
            system.info("[AppServer] express-app running on port %s", this.port);
        });

        system.debug("API Server start");
        setInterval(() => {
            system.debug("API is running");
        }, env.HEARTBEAT_INTERVAL_MS);
    }

    // 리소스 정리 후 항상 null로 초기화 해주기 (클린업 패턴)
    async shutdown() {
        if (!this.server) return;

        try {
            await new Promise((resolve, reject) => {
                this.server.close((err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });
            this.app = null;
            this.server = null;
            system.info("[AppServer] Server closed successfully");
        } catch (err) {
            system.error("[AppServer] Error during shutdown: ", err);
        }
    }
}

module.exports = AppServer;