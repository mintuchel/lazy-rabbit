import { system } from "../system";
import { messageBroker } from "../lib/message-broker";
import { ExchangeDefinitions } from "../config/rabbitmq/exchange";
import * as routingKeys from "./routing";
import * as amqp from 'amqplib';

type DispatchFunction = (channel: amqp.Channel, msg: amqp.Message) => Promise<any>;

const authHandlerMap = new Map<string, DispatchFunction>();

const routingKeyList = [routingKeys.SMS_NOTIFICATION_RK, routingKeys.EMAIL_NOTIFICATION_RK, routingKeys.SLACK_NOTIFICATION_RK];

function getRandomRoutingKey(correlationId: string, type: string): string {
    const index = [...correlationId].reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % routingKeyList.length;
    return routingKeyList[index] + '.' + type;
}

authHandlerMap.set('auth.login', async (channel: amqp.Channel, msg: amqp.Message) => {
    try {
        const payload = JSON.parse(msg.content.toString());
        system.info("[RECIEVED] AuthService (Login): ", payload);

        const correlationId = msg.properties.correlationId || '';
        const routingKey = getRandomRoutingKey(correlationId, 'login');

        messageBroker.publishToExchange(channel, ExchangeDefinitions.NOTIFICATION_EXCHANGE, routingKey, payload);

        channel.ack(msg);
        return 'LOGIN SUCCESS!';
    } catch (err) {
        channel.nack(msg, false, false);
        throw new Error(err as string);
    }
});

authHandlerMap.set('auth.signup', async (channel: amqp.Channel, msg: amqp.Message) => {
    try {
        const payload = JSON.parse(msg.content.toString());
        system.info("[RECIEVED] AuthService (SignUp): ", payload);

        const correlationId = msg.properties.correlationId || '';
        const routingKey = getRandomRoutingKey(correlationId, 'signup');

        messageBroker.publishToExchange(channel, ExchangeDefinitions.NOTIFICATION_EXCHANGE, routingKey, payload);

        channel.ack(msg);
        return 'SIGNUP SUCCESS!';
    } catch (err) {
        channel.nack(msg, false, false);
        throw new Error(err as string);
    }
});

export { authHandlerMap }; 