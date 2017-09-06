// import { max, min, Ord } from 'ramda';
import { max, min, last } from 'lodash';
import * as R from 'ramda';
import { Candle } from '../types/candle';

// StochRSI = [(Current RSI – Lowest Low RSI Value in n periods) / (Highest High RSI Value in n periods – Lowest Low RSI Value in n periods)] x 100
const calculateRsi = (currentRsi: number, lowestRsi: number, highestRsi: number) => {
  const stochRsi: number = ((currentRsi - lowestRsi) / (highestRsi - lowestRsi)) * 100;
  return stochRsi;
};


const calculateStochRsiFromCandles = (candle: Candle, periods = 14) => {
  if (periods <= 0 ) {
    console.error('periods must be a positive integer');
  }
  
  // identify dependencies (13 previous plus current candle)

  // make sure rs is calculated for previous

  // calculate rsi for previous

  // calculate rsi for current
 

};

const getPreviousN = (candle: Candle, n: number) => {
  let prev 
}

const calculateSingleRsi = (rsiValues: Array<number>, periods = 14) => {
  if (rsiValues.length !== periods) {
    console.warn('RSI value length not equal to the period length, calcing anyways');
  }

  const lowestRsi = getLowestRsi(rsiValues);
  const highestRsi = getHighestRsi(rsiValues);
  const currentRsi = getCurrentRsi(rsiValues);
  const stochRsi = calculateRsi(currentRsi, lowestRsi, highestRsi);
  return stochRsi;
}

const getLowestRsi = (rsiArray: Array<number>) => min(rsiArray);
const getHighestRsi = (rsiArray: Array<number>) => max(rsiArray);
const getCurrentRsi = (rsiArray: Array<number>) => last(rsiArray);