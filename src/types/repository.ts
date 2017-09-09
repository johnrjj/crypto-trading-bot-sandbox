import { HistoryTick } from './tick';

interface Repository {
  getTicks(): Promise<Array<HistoryTick>>;
  getCurrentTick();
}

export {
  Repository,
}