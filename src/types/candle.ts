interface Candle {
  timestamp: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  baseVolume: number;
  rs?: number;
  rsi?: number;
  stochRsi?: number;
  next: Candle | null;
  previous: Candle | null;
}

export {
  Candle,
};