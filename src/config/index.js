import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: process.env.PORT,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: Number(process.env.DB_PORT),
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  MSG_QUEUE_URL: process.env.MSG_QUEUE_URL,
  EXCHANGE_NAME: process.env.EXCHANGE_NAME,
  NOTIFICATION_QUEUE_NAME: process.env.NOTIFICATION_QUEUE_NAME,
  SCHEDULER_QUEUE_NAME: process.env.SCHEDULER_QUEUE_NAME,
}