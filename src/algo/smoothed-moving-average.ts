// // import { max, min, Ord } from 'ramda';
import { mean } from 'lodash';
// import * as R from 'ramda';
// import { Candle } from '../types/candle';
// import { calculateRsi } from './rsi';
// import { getNPrevious } from '../util';

const calculateSmmaFirstTime = (window: Array<number>) => mean(window);

const calculateSmmaSubsequent = (previousSmma: number, newValue: number, smoothPeriod: number) => {
  const newSmma = (((previousSmma * smoothPeriod) - previousSmma + newValue)) / smoothPeriod;
  return newSmma;
}

export {
  calculateSmmaFirstTime,
  calculateSmmaSubsequent,
}

// // assumes using close
// const smmaFormula = (candle: Candle, periods: number = 3) => {
//   if (candle.previous && candle.previous.smma) {
//     const smma = (((candle.previous.smma * 3) - candle.previous.smma + candle.stochRsi)) / periods;
//     candle.smma = smma;
//     return candle;
//   } else {
//     console.log('wut wut, smmaFormula');
//   }
// }

// const calculateStochRsiSmma = (candle: Candle, periodsLeftToRecurse: number = 3) => {
//   if (candle.previous.smma === null || candle.previous.smma === undefined) {
//     if (periodsLeftToRecurse <= 1) {
//       const initialSmma =  averagePeriod(candle, 3 /*fix this hardcoded, not passing periods thoguh!!*/);
//       candle.smma = initialSmma;
//     } else {
//       calculateStochRsiSmma(candle.previous, periodsLeftToRecurse - 1);
//       smmaFormula(candle, 3);
//     }
//   } else {
//     return smmaFormula(candle, 3);
//   }
// }

// const averagePeriod = (candle: Candle, periods: number = 3) => {
//   const deps = getNPrevious(candle, periods - 1);
//   const arr = [...deps, candle];
//   const closingWindow = arr.map(x => x.stochRsi);
//   return mean(closingWindow);
// }

// export {
//   calculateStochRsiSmma,
// }