// import { max, min, Ord } from 'ramda';
import { max, min, last } from 'lodash';
import * as R from 'ramda';
import { Candle } from '../types/candle';
import { calculateRsi } from './rsi';
import { getNPrevious } from '../util';

const DEFAULT_PERIODS = 14;

// StochRSI = [(Current RSI – Lowest Low RSI Value in n periods) / (Highest High RSI Value in n periods – Lowest Low RSI Value in n periods)] x 100
const computeStochRsi = (currentRsi: number, lowestRsi: number, highestRsi: number) => {
  const stochRsi: number = ((currentRsi - lowestRsi) / (highestRsi - lowestRsi)) * 100.0;
  return stochRsi;
};

const calculateStochRsi = (candle: Candle, periods = DEFAULT_PERIODS) => {
  // console.log(`calcing stoch rsi for ${candle.timestamp}`);
  if (periods <= 0 ) {
    console.error('periods must be a positive integer');
  }

  // identify dependencies (13 previous plus current candle)
  const deps = getNPrevious(candle, periods - 1);

  
  // make sure rsi is calculated for previous deps
  deps.forEach((curCandle, idx) => {
    // console.log(`before calc rsi for ${idx}: ${curCandle.rsi}`);
    if (curCandle.rsi === null || curCandle.rsi === undefined) {
      // console.log('calc');
      calculateRsi(curCandle, periods);
    }
    // console.log(`calced dep rsi ${idx + 1}: ${curCandle.rsi}`);
  });

  // make sure rsi is calculated for current
  calculateRsi(candle, periods);
  // console.log(`caled cur candle rsi ${candle.timestamp}: ${candle.rsi}`)

  const values = [...deps, candle];
  const rsiValues = values.map(x => x.rsi);
  const stochRsi = calculateSingleStochRsi(rsiValues);
  candle.stochRsi = stochRsi;
  // calculate rsi for current
  return candle;
};


const calculateSingleStochRsi = (rsiValues: Array<number>, periods = 14) => {
  const lowestRsi = getLowestRsi(rsiValues);
  const highestRsi = getHighestRsi(rsiValues);
  const currentRsi = getCurrentRsi(rsiValues);
  const stochRsi = computeStochRsi(currentRsi, lowestRsi, highestRsi);
  return stochRsi;
}

const getLowestRsi = (rsiArray: Array<number>) => min(rsiArray);
const getHighestRsi = (rsiArray: Array<number>) => max(rsiArray);
const getCurrentRsi = (rsiArray: Array<number>) => last(rsiArray);

export {
  calculateStochRsi,
}