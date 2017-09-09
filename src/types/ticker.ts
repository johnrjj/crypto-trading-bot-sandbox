import * as uuidv4 from 'uuid/v4';
import { Repository } from '../types/repository';
import { HistoryTick } from '../types/tick';
import { last } from 'lodash';

class TicksContainer {
  pointer: HistoryTick = null;
  processQueue: Array<HistoryTick> = [];
  repository: Repository;
  key: string;
  constructor(key, repository: Repository, initialHistory: Array<HistoryTick>) {
    this.key = key;
    this.repository = repository;
    this.processQueue = [...initialHistory];
    while (this.processQueue.length > 0) {
      const [x, ...rest] = this.processQueue;
      this.processItem(x);
      this.processQueue = rest;
    }
    console.log('Finished processing initial history');
  }

  getLatestHistoryTicks = async () => {
    console.log('getting new history');
    const lastSeenHistoryTickTimestamp = this.pointer && this.pointer.timestamp;
    const latestHistory = await this.repository.getTicks();
    console.log(last(latestHistory).timestamp);
    const historyNotYetProcessed: Array<HistoryTick> = latestHistory.filter(x => x.timestamp > lastSeenHistoryTickTimestamp);
    if (historyNotYetProcessed.length > 0) {
      console.log('new history!!', JSON.stringify(historyNotYetProcessed));      
    }
  }

  public addItem(item: HistoryTick) {


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
  }


}

export {
  TicksContainer,
}