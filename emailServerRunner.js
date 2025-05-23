import { recieveEmailRpcMessage } from "./src/msgq/consumers/emailConsumer.js";

recieveEmailRpcMessage(async function(payload) {
    console.log('RPC Request Received:', payload);
    // 작업 처리 후 응답 반환
    return {
        success: true, message: `Email sent to ${payload.email}`
    };
});