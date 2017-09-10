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
  stockRsiSmma: WeakMap<HistoryTick, number> = new WeakMap();


  getRsi(t: HistoryTick, saveAverages = false): number {

    if (this.rsi.has(t)) {
      return this.rsi.get(t);
    } else {
      // first time calc
      if (t.previous === null || !this.avgGainMap.has(t.previous))  {
        // console.log('first time calc');

        const windowOfTicks = getNPrevious(t, 15, true);      

        if (windowOfTicks.length < 15) {
          // console.log(`Not enough data yet to calculate the RSI, only ${windowOfTicks.length} data points`);
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

  // getStochRsi(t: HistoryTick) {
  //   const rsiValues = getNPrevious(t, 14, true).map(tick => {
  //     const rsi = this.getRsi(tick);
  //     return rsi;
  //     // const rsiWindow = diff(getNPrevious(t, 14, true).map(x => x.close));
  //     // return calculateRsi(rsiWindow);
  //   });
  //   const currentRsiStoch = calculateStochRsi(rsiValues, 14);
  //   return currentRsiStoch;
  // }

  // averageLastThreeStochRsi(t: HistoryTick) {
  //   return calculateSmmaFirstTime(
  //     getNPrevious(t, 3, true)
  //       .map(x => this.getRsi(t))
  //   );
  // }

  // updateStochRsiSmma(currentStochRsi: number) {
  //   return calculateSmmaSubsequent(this.stochRsiSmma, currentStochRsi, 3)
  // }

  run(t: TicksContainer) {
    if (t === null) {
      console.log('null in strat runner', t);
      return;
    }

    const rsi = this.getRsi(t.pointer);
    console.log(`${t.pointer.timestamp}:\t${rsi}`);
    // const stochRsi = this.getStochRsi(t.pointer);
    // const stockRsiSmma = (this.stochRsiSmma !== null) 
    //   ? this.averageLastThreeStochRsi(t.pointer)
    //   : this.updateStochRsiSmma(stochRsi)

    // const previousRsi = this.rsi;
    // const previousStochRsiSmma = this.stochRsiSmma;
    // console.log(rsi, stochRsi, t.pointer.timestamp);
    // if (
    //   (previousRsi < rsi && previousStochRsiSmma > stockRsiSmma)      
    // ) {
    //   console.log('rsi going up');
    // }
    
    // // Update to latest
    // this.rsi = rsi;
    // this.stochRsiSmma = stockRsiSmma;
  }
}

export {
  RsiStochRsiStrategy,
}