import { last } from 'lodash';
import { Strategy } from '../types/strategy';
import { HistoryTick } from '../types/tick';
import { TicksContainer } from '../types/ticker';
import { getNPrevious } from '../util';
import { calculateRsi } from '../algo/rsi';
import { calculateStochRsi } from '../algo/stoch-rsi';
import { calculateSmmaFirstTime, calculateSmmaSubsequent } from '../algo/smoothed-moving-average';

class RsiStochRsiStrategy implements Strategy {
  stochRsiSmma: number = null;
  rsi: number = null;

  getRsi(t: HistoryTick) {
    const rsiWindow = getNPrevious(t, 14, true).map(x => (x.close - x.open));
    const rsi = calculateRsi(rsiWindow);
    return rsi;
  }

  getStochRsi(t: HistoryTick) {
    const rsiValues = getNPrevious(t, 14, true).map(tick => {
      const rsiWindow = getNPrevious(t, 14, true).map(x => (x.close - x.open));
      return calculateRsi(rsiWindow);
    });
    const currentRsiStoch = calculateStochRsi(rsiValues, 14);
    return currentRsiStoch;
  }

  averageLastThreeStochRsi(t: HistoryTick) {
    return calculateSmmaFirstTime(
      getNPrevious(t, 3, true)
        .map(x => this.getRsi(t))
    );
  }

  updateStochRsiSmma(currentStochRsi: number) {
    return calculateSmmaSubsequent(this.stochRsiSmma, currentStochRsi, 3)
  }

  run(t: TicksContainer) {
    const rsi = this.getRsi(t.pointer);
    const stochRsi = this.getStochRsi(t.pointer);
    const stockRsiSmma = (this.stochRsiSmma !== null) 
      ? this.averageLastThreeStochRsi(t.pointer)
      : this.updateStochRsiSmma(stochRsi)

    const previousRsi = this.rsi;
    const previousStochRsiSmma = this.stochRsiSmma;
    if (
      (previousRsi < rsi && previousStochRsiSmma > stockRsiSmma)      
    ) {
      console.log('rsi going up');
    }
    
    // Update to latest
    this.rsi = rsi;
    this.stochRsiSmma = stockRsiSmma;
  }
}