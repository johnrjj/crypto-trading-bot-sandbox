import { Candle } from '../types/candle';
import { getNPrevious } from '../util';

// RSI: 
// Average Gain = Sum of Gains over the past 14 periods / 14.
// Average Loss = Sum of Losses over the past 14 periods / 14
// RS = Average Gain / Average Loss;
// RSI = 100 - (100 / (1 + RS))

const DEFAULT_PERIODS = 14;

const getDependencies = (current: Candle, periods: number): Array<Candle> => {
  const deps = getNPrevious(current, periods).filter(x => x !== null);
  if (deps.length !== periods) {
    console.warn(`
      Warning, ${current.timestamp} does not have enough previous history. 
      (Only found ${deps.length}, instead of requested ${periods}
    `);
  }
  return deps;
}

// const calculateDeps = (deps: Array<Candle>, periods: number = DEFAULT_PERIODS) => {
//   deps.forEach(dep => {
//     if (dep.rsi === null) {
//       _calculateRsi(dep);
//     }
//   })
// };

const calculateRsi = (current: Candle, periods: number = DEFAULT_PERIODS) => {
  const deps: Array<Candle> = getDependencies(current, periods - 1);
  const window: Array<Candle> = [...deps, current];

  // avg gains
  const windowGains = window.map(x => {
    // console.log(x);
    const val = Math.max(x.close - x.open, 0);
    return val;
  });
  // console.log(windowGains);
  const gainTotal = windowGains.reduce((total, cur) => {
    return total += cur;
  }, 0);
  // console.log(gainTotal);
  const gainAvg = gainTotal / windowGains.length;

  // losses
  const windowLosses = window.map(x => {
    const val = Math.abs(Math.min(x.close - x.open, 0));
    return val;
  });
  const lossTotal = windowLosses.reduce((total, cur) => {
    return total += cur;
  });
  // console.log(lossTotal);
  const lossAvg = lossTotal / windowLosses.length;

  // console.log(`Average loss: ${lossAvg}`);
  // console.log(`Average gain: ${gainAvg}`);

  const rs = gainAvg / lossAvg;
  // console.log(`RS: ${rs}`);
  const rsi = 100.0 - (100.0 / (1 + rs));
  // console.log(`RSI: ${rsi}`);
  // console.log(rsi);
  current.rsi = rsi;
  return current;
};

export { 
  calculateRsi,
};