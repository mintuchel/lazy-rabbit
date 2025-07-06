import { MessageBroker } from "../../lib";
import { env } from "../config";

const messageBroker = new MessageBroker(env.MSG_QUEUE_URL || "");

// export MessageBroker instance used across example demo app
export { messageBroker }; 