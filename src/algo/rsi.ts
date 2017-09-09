import { getNPrevious } from '../util';

// // RSI: 
// // Average Gain = Sum of Gains over the past 14 periods / 14.
// // Average Loss = Sum of Losses over the past 14 periods / 14
// // RS = Average Gain / Average Loss;
// // RSI = 100 - (100 / (1 + RS))

const DEFAULT_PERIODS = 14;

// windowGainOrLoss = [-3.23, 4.76, ...]
const calculateRsi = (windowOfGainOrLoss: Array<number>, periods: number = DEFAULT_PERIODS) => {

  if (windowOfGainOrLoss.length !== periods) {
    console.log(`Warning, calculating RSI with a window of ${windowOfGainOrLoss.length} instead of ${periods}`);
  }

  // avg gains
  const windowGains = windowOfGainOrLoss.map(val => Math.max(val, 0));
  const gainTotal = windowGains.reduce((total, cur) => {
    return total += cur;
  }, 0);
  const gainAvg = gainTotal / windowGains.length;

  // avg losses
  const windowLosses = windowOfGainOrLoss.map(val => Math.abs(Math.min(val, 0)));
  const lossTotal = windowLosses.reduce((total, cur) => {
    return total += cur;
  });
  const lossAvg = lossTotal / windowLosses.length;
  
  // calc rs and rsi
  const rs = gainAvg / lossAvg;
  const rsi = 100.0 - (100.0 / (1 + rs));
  return rsi;
};

export { 
  calculateRsi,
};