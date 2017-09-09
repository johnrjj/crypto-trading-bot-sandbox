interface Tick {

}

interface CurrentTick extends Tick {

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

export {
  HistoryTick,
};