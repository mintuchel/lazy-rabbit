import { sendEmailRpcMessage } from '../msgq/producers/emailProducer.js';

export async function sendEmailByUserId(userId) {
  const result = await sendEmailRpcMessage(userId);
  console.log('(service) RPC message queue response :', result);
  return result;
}