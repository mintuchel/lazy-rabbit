import * as logs from "./logs";

export const system = {
    info: logs.info,
    debug: logs.debugLog,
    error: logs.error,
    log: logs.log,
    warning: logs.warning
}; 