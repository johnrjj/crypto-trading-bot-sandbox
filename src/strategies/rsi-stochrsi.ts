import { last } from 'lodash';
import { Strategy } from '../types/strategy';
import { HistoryTick } from '../types/tick';
import { TicksContainer } from '../types/ticker';
import { Trade, TradeType } from '../types/trade';
import { getNPrevious } from '../util';
import { calculateRsiFirst, calculateRsiSubsequent } from '../algo/rsi';
import { calculateStochRsi } from '../algo/stoch-rsi';
import {
  calculateSmmaFirstTime,
  calculateSmmaSubsequent,
} from '../algo/smoothed-moving-average';

const RSI_OVERSOLD_THRESHOLD: number = 70;
const RSI_UNDERSOLD_THRESHOLD: number = 30;
const STOCH_RSI_OVERSOLD_THRESHOLD: number = 80;
const STOCH_RSI_UNDERSOLD_THRESHOLD: number = 20;

const isOversold = (rsi: number, stochRsi: number): boolean => {
  return (
    rsi >= RSI_OVERSOLD_THRESHOLD && stochRsi >= STOCH_RSI_OVERSOLD_THRESHOLD
  );
};

const isUndersold = (rsi: number, stochRsi: number): boolean => {
  return (
    rsi <= RSI_UNDERSOLD_THRESHOLD && stochRsi <= STOCH_RSI_UNDERSOLD_THRESHOLD
  );
};

const diff = (arr: Array<number>) =>
  arr.map((cur, idx, arr) => {
    const prev = arr[idx - 1] || cur;
    const change = cur - prev;
    return change;
  });

class RsiStochRsiStrategy implements Strategy {
  avgGainMap: WeakMap<HistoryTick, number> = new WeakMap();
  avgLossMap: WeakMap<HistoryTick, number> = new WeakMap();
  rsi: WeakMap<HistoryTick, number> = new WeakMap();
  stochRsiMap: WeakMap<HistoryTick, number> = new WeakMap();
  stochRsiSmma: WeakMap<HistoryTick, number> = new WeakMap();

  // actual strategy
  hasBrokenOversoldThresholdRecently = false;
  hasBrokenUndersoldThresholdRecently = false;
  lastSeenUndersold: HistoryTick = null;
  lastSeenOversold: HistoryTick = null;

  run(t: TicksContainer): Array<Trade> {
    if (t === null) {
      console.log('null in strat runner', t);
      return;
    }
    const rsi = this.getRsi(t.pointer);
    const stochRsi = this.getStockRsiSmma(t.pointer);

    // If we don't have an RSI or StochRSI, don't do anything.
    if (rsi === null || stochRsi === null) {
      return null;
    }

    if (!this.hasBrokenOversoldThresholdRecently && isOversold(rsi, stochRsi)) {
      // console.log('oversold threshold broken');
      // console.log(
      //   `oversold threshold broken\t@ ${t.pointer.close} -\t ${t.pointer
      //     .timestamp}`
      // );
      this.hasBrokenOversoldThresholdRecently = true;
      const trade: Trade = {
        currencyA: t.currencyA,
        currencyB: t.currencyB,
        type: TradeType.SELL,
        currentPrice: t.pointer.close,
      }
      return [trade];
    } else if (
      this.hasBrokenOversoldThresholdRecently &&
      !isOversold(rsi, stochRsi)
    ) {
      // console.log('no longer oversold');
      this.hasBrokenOversoldThresholdRecently = false;
    } else if (
      !this.hasBrokenUndersoldThresholdRecently &&
      isUndersold(rsi, stochRsi)
    ) {
      // console.log(
      //   `undersold threshold broken\t@ ${t.pointer.close} -\t ${t.pointer
      //     .timestamp}`
      // );
      this.hasBrokenUndersoldThresholdRecently = true;
      const trade: Trade = {
        currencyA: t.currencyA,
        currencyB: t.currencyB,
        type: TradeType.BUY,
        currentPrice: t.pointer.close,
      }
      return [trade];
    } else if (
      this.hasBrokenUndersoldThresholdRecently &&
      !isUndersold(rsi, stochRsi)
    ) {
      // console.log('no longer undersold');
      this.hasBrokenUndersoldThresholdRecently = false;
    }

    return null;
  }

  getRsi(t: HistoryTick): number {
    if (this.rsi.has(t)) {
      return this.rsi.get(t);
    } else {
      // first time calc
      if (t.previous === null || !this.avgGainMap.has(t.previous)) {
        const windowOfTicks = getNPrevious(t, 15, true);
        if (windowOfTicks.length < 15) {
          console.log(
            `Not enough data yet to calculate the RSI, only ${windowOfTicks.length} data points`
          );
          return null;
        }
        const windowOfGainsAndLosses = diff(windowOfTicks.map(x => x.close));
        const { avgGain, avgLoss, rsi } = calculateRsiFirst(
          windowOfGainsAndLosses
        );
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
          currentLoss
        );

        this.avgGainMap.set(t, avgGain);
        this.avgLossMap.set(t, avgLoss);
        this.rsi.set(t, rsi);
      }
    }
    return this.rsi.get(t);
  }

  getStochRsi(t: HistoryTick) {
    if (this.stochRsiMap.has(t)) {
      return this.stochRsiMap.get(t);
    }
    const windowOfTicks = getNPrevious(t, 14, true);
    const windowOfRsiValues = windowOfTicks
      .map(x => this.getRsi(x))
      .filter(x => x !== null);

    if (windowOfRsiValues.length < 14) {
      console.log(
        `Stoch RSI unable to calc yet, not enough data points (detected ${windowOfRsiValues.length} vs required 14`
      );
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
    const windowOfTicks = getNPrevious(t, 3, true);
    const fn = this.getStochRsi.bind(this);
    const windowOfStochRsiValues = windowOfTicks
      .map(x => fn(x))
      .filter(x => x !== null);

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
        const stochRsiSmma = calculateSmmaSubsequent(
          previousSmma,
          currentStochRsi,
          3
        );
        this.stochRsiSmma.set(t, stochRsiSmma);
        return stochRsiSmma;
      }
    } else {
      return null;
    }
  }
}

export { RsiStochRsiStrategy };
