import { $$asyncIterator } from 'iterall';
import { PubSubEngine } from 'graphql-subscriptions';

export class PubSubAsyncIterator<T> implements AsyncIterator<T> {

  constructor(pubsub: PubSubEngine, eventNames: string | string[], options?: unknown) {
    this.pubsub = pubsub;
    this.options = options;
    this.pullQueue = [];
    this.pushQueue = [];
    this.listening = true;
    this.eventsArray = typeof eventNames === 'string' ? [eventNames] : eventNames;
  }

  public async next() {
    await this.subscribeAll();
    return this.listening ? this.pullValue() : this.return();
  }

  public async return(): Promise<{ value: unknown, done: true }> {
    await this.emptyQueue();
    return { value: undefined, done: true };
  }

  public async throw(error: Error): Promise<never> {
    await this.emptyQueue();
    return Promise.reject(error);
  }

  public [$$asyncIterator]() {
    return this;
  }

  private pullQueue: Array<(data: { value: unknown, done: boolean }) => void>;
  private pushQueue: any[];
  private eventsArray: string[];
  private subscriptionIds: Promise<number[]> | undefined;
  private listening: boolean;
  private pubsub: PubSubEngine;
  private options: unknown;

  private async pushValue({ payload: event }: { payload: T }) {
    await this.subscribeAll();
    if (this.pullQueue.length !== 0) {
      this.pullQueue.shift()!({ value: event, done: false });
    } else {
      this.pushQueue.push(event);
    }
  }

  private pullValue(): Promise<IteratorResult<any>> {
    return new Promise(resolve => {
      if (this.pushQueue.length !== 0) {
        resolve({ value: this.pushQueue.shift(), done: false });
      } else {
        this.pullQueue.push(resolve);
      }
    });
  }

  private async emptyQueue() {
    if (this.listening) {
      this.listening = false;
      if (this.subscriptionIds) this.unsubscribeAll(await this.subscriptionIds);
      this.pullQueue.forEach(resolve => resolve({ value: undefined, done: true }));
      this.pullQueue.length = 0;
      this.pushQueue.length = 0;
    }
  }

  private subscribeAll() {
    if (!this.subscriptionIds) {
      this.subscriptionIds = Promise.all(this.eventsArray.map(
        eventName => this.pubsub.subscribe(eventName, this.pushValue.bind(this), this.options as Object),
      ));
    }
    return this.subscriptionIds;
  }

  private unsubscribeAll(subscriptionIds: number[]) {
    for (const subscriptionId of subscriptionIds) {
      this.pubsub.unsubscribe(subscriptionId);
    }
  }

}