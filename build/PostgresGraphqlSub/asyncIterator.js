"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PubSubAsyncIterator = void 0;
const iterall_1 = require("iterall");
class PubSubAsyncIterator {
    constructor(pubsub, eventNames, options) {
        this.pubsub = pubsub;
        this.options = options;
        this.pullQueue = [];
        this.pushQueue = [];
        this.listening = true;
        this.eventsArray = typeof eventNames === 'string' ? [eventNames] : eventNames;
    }
    next() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.subscribeAll();
            return this.listening ? this.pullValue() : this.return();
        });
    }
    return() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.emptyQueue();
            return { value: undefined, done: true };
        });
    }
    throw(error) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.emptyQueue();
            return Promise.reject(error);
        });
    }
    [iterall_1.$$asyncIterator]() {
        return this;
    }
    pushValue({ payload: event }) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.subscribeAll();
            if (this.pullQueue.length !== 0) {
                this.pullQueue.shift()({ value: event, done: false });
            }
            else {
                this.pushQueue.push(event);
            }
        });
    }
    pullValue() {
        return new Promise(resolve => {
            if (this.pushQueue.length !== 0) {
                resolve({ value: this.pushQueue.shift(), done: false });
            }
            else {
                this.pullQueue.push(resolve);
            }
        });
    }
    emptyQueue() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.listening) {
                this.listening = false;
                if (this.subscriptionIds)
                    this.unsubscribeAll(yield this.subscriptionIds);
                this.pullQueue.forEach(resolve => resolve({ value: undefined, done: true }));
                this.pullQueue.length = 0;
                this.pushQueue.length = 0;
            }
        });
    }
    subscribeAll() {
        if (!this.subscriptionIds) {
            this.subscriptionIds = Promise.all(this.eventsArray.map(eventName => this.pubsub.subscribe(eventName, this.pushValue.bind(this), this.options)));
        }
        return this.subscriptionIds;
    }
    unsubscribeAll(subscriptionIds) {
        for (const subscriptionId of subscriptionIds) {
            this.pubsub.unsubscribe(subscriptionId);
        }
    }
}
exports.PubSubAsyncIterator = PubSubAsyncIterator;
//# sourceMappingURL=asyncIterator.js.map