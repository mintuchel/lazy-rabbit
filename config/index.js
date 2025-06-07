const dotenv = require('dotenv');

dotenv.config();

// 환경변수 로딩
// 타 클래스에서는 env 변수를 통해 환경변수 접근
const env = {
  PORT: process.env.PORT,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: Number(process.env.DB_PORT),
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  MSG_QUEUE_URL: process.env.MSG_QUEUE_URL,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT
};

module.exports = { env };