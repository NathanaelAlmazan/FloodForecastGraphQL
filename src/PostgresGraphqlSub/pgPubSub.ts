import { PubSubEngine } from "graphql-subscriptions";
import { Client } from "pg";
import { PgIPC, CustomEventEmitter } from "./pgIPC";
import { PubSubAsyncIterator } from "./asyncIterator"

export type OnMessage<T> = (message: T) => void;
export type Path = Array<string | number>;
export type Trigger = string | Path;
export type TriggerTransform = (
        trigger: Trigger,
        channelOptions?: unknown,
    ) => string;

export class PostgresPubSub extends PubSubEngine {
    eventEmitter: CustomEventEmitter
    subIdCounter: number
    subscriptionMap: { [subId: number]: [string, OnMessage<any>] }
    triggerTransform: TriggerTransform

    constructor(
        pgClient: Client,
        triggerTransform?: TriggerTransform
    ) {
        super();

        this.eventEmitter = PgIPC(pgClient)
        this.subIdCounter = 0
        this.subscriptionMap = {}
        this.triggerTransform = triggerTransform || (trigger => trigger as string)
    }

    public publish(triggerName: string, payload: any): Promise<void> {
        return Promise.resolve(this.eventEmitter.notify(triggerName, payload))
    }

    public subscribe<T>(trigger: string, onMessage: OnMessage<T | Error>, options: unknown = {}): Promise<number> {
        const triggerName: string = this.triggerTransform(trigger, options)

        this.eventEmitter.on(triggerName, onMessage)
        this.subIdCounter += 1
        this.subscriptionMap[this.subIdCounter] = [triggerName, onMessage]
        return Promise.resolve(this.subIdCounter)
    }

    public unsubscribe(subId: number) {
        const [triggerName, onMessage] = this.subscriptionMap[subId]
        delete this.subscriptionMap[subId]
        this.eventEmitter.removeListener(triggerName, onMessage);
    }

    public asyncIterator<T>(triggers: string | string[]): AsyncIterator<T> {
        return new PubSubAsyncIterator<T>(this, triggers)
    }
}