interface Candle {
  timestamp: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  baseVolume: number;
  rs?: number;
  rsi?: number | null;
  stochRsi?: number | null;
  next: Candle | null;
  previous: Candle | null;
}

export {
  Candle,
};