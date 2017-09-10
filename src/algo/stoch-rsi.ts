import { max, min, last } from 'lodash';

// StochRSI = [(Current RSI – Lowest Low RSI Value in n periods) / (Highest High RSI Value in n periods – Lowest Low RSI Value in n periods)] x 100
const calculateStochRsi = (rsiValues: Array<number>, periods: number = 14) => {
  if (rsiValues.length !== periods) {
    console.log(
      `Stoch RSI will be somewhat inaccurate, only ${rsiValues.length} detected vs requested ${periods}`
    );
  }

  const lowestRsi = min(rsiValues);
  const highestRsi = max(rsiValues);
  const currentRsi = last(rsiValues);

  const stochRsi: number =
    (currentRsi - lowestRsi) / (highestRsi - lowestRsi) * 100.0;
  return stochRsi;
};

export { calculateStochRsi };

// import * as R from 'ramda';
// import { Candle } from '../types/candle';
// import { calculateRsi } from './rsi';
// import { getNPrevious } from '../util';

// const DEFAULT_PERIODS = 14;

// const calculateStochRsi = (candle: Candle, periods = DEFAULT_PERIODS) => {
//   // console.log(`calcing stoch rsi for ${candle.timestamp}`);
//   if (periods <= 0 ) {
//     console.error('periods must be a positive integer');
//   }

//   // identify dependencies (13 previous plus current candle)
//   const deps = getNPrevious(candle, periods - 1);

//   // make sure rsi is calculated for previous deps
//   deps.forEach((curCandle, idx) => {
//     // console.log(`before calc rsi for ${idx}: ${curCandle.rsi}`);
//     if (curCandle.rsi === null || curCandle.rsi === undefined) {
//       // console.log('calc');
//       calculateRsi(curCandle, periods);
//     }
//     // console.log(`calced dep rsi ${idx + 1}: ${curCandle.rsi}`);
//   });

//   // make sure rsi is calculated for current
//   calculateRsi(candle, periods);
//   // console.log(`caled cur candle rsi ${candle.timestamp}: ${candle.rsi}`)

//   const values = [...deps, candle];
//   const rsiValues = values.map(x => x.rsi);
//   const stochRsi = calculateSingleStochRsi(rsiValues);
//   candle.stochRsi = stochRsi;
//   // calculate rsi for current
//   return candle;
// };
