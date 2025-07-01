const Worker = require("./worker");
const MessageBroker = require("./message-broker");

// npm 패키지는 기본적으로 package.json의 main 필드에 지정된 파일이 진입점이 됨.
// 현재 진입점이 lib/index.js 이므로, 이 파일에서 내보내는 모듈들이 패키지의 메인 모듈이 됨.
// 이 이후에는 const { Worker, MessageBroker } = require('lazy-rabbit') 와 같이 사용 가능함!

module.exports = {
    Worker,
    MessageBroker
}