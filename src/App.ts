import { getCandlesFromCsv } from './load-csv';
import { getTicksFromStaticJson } from './parse-api-json';
import { calculateRsi } from './algo/rsi';
import { Candle } from './types/candle';
import { ApiTick } from './types/api';

const convertApiToDomain = (tick: ApiTick) => {
  const c: Candle = {
    timestamp: tick.T,
    open: tick.O,
    close: tick.C,
    high: tick.H,
    low: tick.L,
    volume: tick.V,
    baseVolume: tick.BV,
    next: null,
    previous: null,
  }
  return c;
}

const linkCandle = (current: Candle, next: Candle, previous: Candle) => {
  current.next = next;
  current.previous = previous;
  return;
}

const run = async () => {
  console.log('starting');

  const candles = getTicksFromStaticJson()
    .map(convertApiToDomain);

  candles.forEach((curCandle, idx, candles) => {
    const prev = candles[idx - 1] || null;
    const next = candles[idx + 1] || null;
    const current = curCandle;
    linkCandle(current, next, prev);
  });

  console.log(`calculating rsi for ${candles[candles.length-1].timestamp}`);
  const candle = calculateRsi(candles[candles.length-1]);
  console.log(candle.rsi);

  // const candles14 = candles.slice(0, 14);

  // candles14.forEach(candle => {
  //   addValue(candle);
  // });
}

(async () => {
  await run();
})();
