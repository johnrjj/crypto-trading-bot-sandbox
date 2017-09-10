import * as uuidv4 from 'uuid/v4';
import { Repository } from '../types/repository';
import { HistoryTick } from '../types/tick';
import { last } from 'lodash';

class TicksContainer {
  pointer: HistoryTick = null;
  processQueue: Array<HistoryTick> = [];
  currencyA: string;
  currencyB: string;
  callbacks = [];
  repository: Repository;
  key: string;
  constructor(
    key,
    repository: Repository,
    currencyA: string,
    currencyB: string,
    initialHistory: Array<HistoryTick> = []
  ) {
    this.key = key;
    this.repository = repository;
    this.processQueue = [...initialHistory];
    this.currencyA = currencyA;
    this.currencyB = currencyB;
    this.processQueueStart();
    console.log('Finished processing initial history');
  }

  registerUpdate(fn: (t: TicksContainer) => {}) {
    this.callbacks.push(fn);
  }

  getLatestHistoryTicks = async () => {
    console.log(`Checking for new ticks for ${this.key}`);
    const lastSeenHistoryTickTimestamp =
      (this.pointer && this.pointer.timestamp) || null;
    const latestHistory = await this.repository.getTicks();
    const historyNotYetProcessed: Array<HistoryTick> = latestHistory.filter(
      x =>
        lastSeenHistoryTickTimestamp
          ? x.timestamp > lastSeenHistoryTickTimestamp
          : true
    );
    if (historyNotYetProcessed.length > 0) {
      console.log(
        `${historyNotYetProcessed.length} new history items for ${this.key}`
      );
    }
    this.processQueue = [...historyNotYetProcessed];
    this.processQueueStart();
  };

  public addItem(item: HistoryTick) {}

  processQueueStart() {
    while (this.processQueue.length > 0) {
      const [x, ...rest] = this.processQueue;
      this.processItem(x);
      this.processQueue = rest;
    }
  }

  processItem(item: HistoryTick) {
    const uuid = uuidv4(); // ⇨ 'df7cca36-3d7a-40f4-8f06-ae03cc22f045'
    item.uuid = uuid;
    // Set next to null
    item.next = null;
    // Set previous to current pointer
    item.previous = this.pointer;
    // Set current pointer to the new item
    this.pointer = item;
    // console.log(`Added ${uuid}`);
    this.callbacks.forEach(cb => {
      cb(this);
    });
  }
}

export { TicksContainer };
