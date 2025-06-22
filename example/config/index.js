const dotenv = require('dotenv');

dotenv.config();

// 환경변수 로딩
// 타 클래스에서는 env 변수를 통해 환경변수 접근
const env = {
  HEARTBEAT_INTERVAL_MS: process.env.HEARTBEAT_INTERVAL_MS,
  MSG_QUEUE_URL: process.env.MSG_QUEUE_URL,
};

module.exports = { env };