import { last } from 'lodash';
import { Strategy } from '../types/strategy';
import { HistoryTick } from '../types/tick';
import { TicksContainer } from '../types/ticker';
import { getNPrevious } from '../util';
import { calculateRsiFirst, calculateRsiSubsequent } from '../algo/rsi';
import { calculateStochRsi } from '../algo/stoch-rsi';
import { calculateSmmaFirstTime, calculateSmmaSubsequent } from '../algo/smoothed-moving-average';

const diff = (arr: Array<number>) => arr.map((cur, idx, arr) => {
  const prev = arr[idx - 1] || cur;
  const change =  cur - prev;
  return change;
});

class RsiStochRsiStrategy implements Strategy {
  avgGainMap: WeakMap<HistoryTick, number> = new WeakMap();
  avgLossMap: WeakMap<HistoryTick, number> = new WeakMap();
  rsi: WeakMap<HistoryTick, number> = new WeakMap();
  stochRsiMap: WeakMap<HistoryTick, number> = new WeakMap();
  stochRsiSmma: WeakMap<HistoryTick, number> = new WeakMap();
  

  getRsi(t: HistoryTick): number {
    if (this.rsi.has(t)) {
      return this.rsi.get(t);
    } else {
      // first time calc
      if (t.previous === null || !this.avgGainMap.has(t.previous))  {
        const windowOfTicks = getNPrevious(t, 15, true);      
        if (windowOfTicks.length < 15) {
          console.log(`Not enough data yet to calculate the RSI, only ${windowOfTicks.length} data points`);
          return null;
        }
        const windowOfGainsAndLosses = diff(windowOfTicks.map(x => x.close));
        const { avgGain, avgLoss, rsi }  = calculateRsiFirst(windowOfGainsAndLosses);
        this.avgGainMap.set(t, avgGain);
        this.avgLossMap.set(t, avgLoss);
        this.rsi.set(t, rsi);
      } else {
        const previousAvgGain: number = this.avgGainMap.get(t.previous);
        const previousAvgLoss: number = this.avgLossMap.get(t.previous);

        const previousClose = t.previous.close;
        const currentClose = t.close;
        const currentGainOrLoss = currentClose - previousClose;

        const currentGain = Math.max(currentGainOrLoss, 0);
        const currentLoss = Math.abs(Math.min(currentGainOrLoss, 0));

        const { avgGain, avgLoss, rsi } = calculateRsiSubsequent(
          previousAvgGain,
          previousAvgLoss,
          currentGain,
          currentLoss,
        );

        this.avgGainMap.set(t, avgGain);
        this.avgLossMap.set(t, avgLoss);
        this.rsi.set(t, rsi);
      }
    }
    return this.rsi.get(t);
  }

  getStochRsi(t: HistoryTick) {
    // console.log('hello?');
    // console.log(this);
    if (this.stochRsiMap.has(t)) {
      // console.log('but not here');
      return this.stochRsiMap.get(t);
    }
    // console.log(1);
    const windowOfTicks = getNPrevious(t, 14, true);
    // console.log(2)
    const windowOfRsiValues = windowOfTicks.map(x => this.getRsi(x)).filter(x => x !== null);
    // console.log(3)

    if (windowOfRsiValues.length < 14) {
      console.log(`Stoch RSI unable to calc yet, not enough data points (detected ${windowOfRsiValues.length} vs required 14`);
      return null;
    }

    const stochRsi = calculateStochRsi(windowOfRsiValues, 14);
    this.stochRsiMap.set(t, stochRsi);

    return this.stochRsiMap.get(t);
  }

  getStockRsiSmma(t: HistoryTick) {
    if (this.stochRsiSmma.has(t)) {
      return this.stochRsiSmma.get(t);
    }
    // console.log('0')
    const windowOfTicks = getNPrevious(t, 3, true);
    // console.log('01');
    // console.log(windowOfTicks);
    const fn = this.getStochRsi.bind(this);
    const windowOfStochRsiValues = windowOfTicks.map(x => fn(x)).filter(x => x !== null);
    // console.log('her');

    // have enough to get the stockrsismma
    if (windowOfStochRsiValues.length > 0) {
      if (t.previous !== null || !this.getStockRsiSmma(t.previous)) {
        // first time, set up the smma
        const stochRsiSmma = calculateSmmaFirstTime(windowOfStochRsiValues);
        this.stochRsiSmma.set(t, stochRsiSmma);
        return stochRsiSmma;
      } else {
        // existing smma
        const previousSmma = this.stochRsiSmma.get(t.previous);
        const currentStochRsi = this.stochRsiMap.get(t);
        const stochRsiSmma = calculateSmmaSubsequent(previousSmma, currentStochRsi, 3);
        this.stochRsiSmma.set(t, stochRsiSmma);
        return stochRsiSmma;
      }
    } else {
      return null;
    }
  }

  run(t: TicksContainer) {
    if (t === null) {
      console.log('null in strat runner', t);
      return;
    }

    const rsi = this.getRsi(t.pointer);
    const stochRsi = this.getStockRsiSmma(t.pointer);
    console.log(`${t.pointer.timestamp}:\t${rsi}\t -- ${stochRsi}`);
  }
}

export {
  RsiStochRsiStrategy,
}