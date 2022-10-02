"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresPubSub = void 0;
const graphql_subscriptions_1 = require("graphql-subscriptions");
const pgIPC_1 = require("./pgIPC");
const asyncIterator_1 = require("./asyncIterator");
class PostgresPubSub extends graphql_subscriptions_1.PubSubEngine {
    constructor(pgClient, triggerTransform) {
        super();
        this.eventEmitter = (0, pgIPC_1.PgIPC)(pgClient);
        this.subIdCounter = 0;
        this.subscriptionMap = {};
        this.triggerTransform = triggerTransform || (trigger => trigger);
    }
    publish(triggerName, payload) {
        return Promise.resolve(this.eventEmitter.notify(triggerName, payload));
    }
    subscribe(trigger, onMessage, options = {}) {
        const triggerName = this.triggerTransform(trigger, options);
        this.eventEmitter.on(triggerName, onMessage);
        this.subIdCounter += 1;
        this.subscriptionMap[this.subIdCounter] = [triggerName, onMessage];
        return Promise.resolve(this.subIdCounter);
    }
    unsubscribe(subId) {
        const [triggerName, onMessage] = this.subscriptionMap[subId];
        delete this.subscriptionMap[subId];
        this.eventEmitter.removeListener(triggerName, onMessage);
    }
    asyncIterator(triggers) {
        return new asyncIterator_1.PubSubAsyncIterator(this, triggers);
    }
}
exports.PostgresPubSub = PostgresPubSub;
//# sourceMappingURL=pgPubSub.js.map