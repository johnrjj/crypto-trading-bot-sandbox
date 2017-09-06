import { getCandlesFromCsv } from './load-csv';
import { getTicksFromStaticJson } from './parse-api-json';
import { calculateRsi } from './algo/rsi';
import { calculateStochRsi } from './algo/stoch-rsi';
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

  // const stopwatchStart = new Date().getMilliseconds();
  const latestCandle = candles[candles.length - 1];
  calculateRsi(latestCandle);
  calculateStochRsi(latestCandle);
  // const stopwatchStop = new Date().getUTCMilliseconds();
  // console.log(`
  //   Start: ${stopwatchStart}
  //   End: ${stopwatchStop}
  //   Elapsed time (ms): ${stopwatchStop - stopwatchStart}`);
}

(async () => {
  await run();
})();
