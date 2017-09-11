interface Tick {
  next: CurrentTick | HistoryTick;
  previous: HistoryTick;
}

interface CurrentTick extends Tick {
  bid: number;
  ask: number;
  last: number;
  low?: number;
  high?: number;
  marketName?: string;
  volume?: number;
  baseVolume?: number;
  timeStamp?: string;
  openBuyOrders?: number;
  openSellOrders?: number;
  prevDay?: number;
  created?: string;
  previous: null;
  next: null;
}

interface HistoryTick extends Tick {
  timestamp: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  baseVolume: number;
  next: HistoryTick;
  previous: HistoryTick;
  uuid?: string;
}

export { HistoryTick, CurrentTick, Tick };
