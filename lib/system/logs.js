const debug = require("debug");

module.exports.info = new debug("app:info");
module.exports.debug = new debug("app:debug");
module.exports.error = new debug("app:error");
module.exports.log = new debug("app:log");
module.exports.warning = new debug("app:warning");
