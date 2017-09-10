import { BittrexRepository } from './repositories/bittrex';
import { BittrexAccount } from './accounts/bittrex';
import { Trader } from './trader/trader';
import { TicksContainer } from './types/ticker';
import { RsiStochRsiStrategy } from './strategies/rsi-stochrsi';

const refresh = async (x: any) => {
  await x.getLatestHistoryTicks();
  setTimeout(() => refresh(x), 1500);
}

const bootup = async () => {
  const repo = new BittrexRepository(
    BittrexRepository.availableCurrencyPairs.USDT_BTC, 
    BittrexRepository.availableTickIntervals.THIRTY_MINUTES
  );

  const account = new BittrexAccount();
  account.deposit('USDT', 1000);

  const initialHistory = await repo.getTicks();

  const strat = new RsiStochRsiStrategy();

  const trader = new Trader(account);

  const currencyA = 'USDT';
  const currencyB = 'BTC';

  const foo = new TicksContainer('BTC-NEO-ONEMINUTE', repo, currencyA, currencyB);
  foo.registerUpdate((newEntity) => {
    // console.log('new ent', Object.keys(newEntity));
    try {
      const trades = strat.run(newEntity);
      trader.attemptTrades(trades)
    } catch (e) {
      console.log(e);
      throw e;
    }

    console.log(`Balances:\n\t${currencyA}: ${account.checkBalance(currencyA)}\n\t${currencyB}: ${account.checkBalance(currencyB)}`);
    return {};
  })

  refresh(foo);
}

//   let accountBalanceUSD_BuyAndHold = 1000.0;
//   let accountBalanceCOIN_BuyAndHold = 0.0;

//   let accountBalanceUSD = 1000.0;
//   let accountBalanceCOIN = 0.0;
//   let tradePercent = 0.70;
//   let tradeCount = 0;

//   // const stopwatchStart = new Date().getMilliseconds();
//   // const latestCandle = candles[candles.length - 1];
//   // calculateRsi(latestCandle);
//   // calculateStochRsi(latestCandle);

//   let startingIdx = 3000;
//   let starting: Candle = candles[candles.length - (candles.length - startingIdx)];
//   let end: Candle = candles[candles.length - 1];

//   let lastUndersoldCandle: Candle = null;
//   let lastOversoldCandle: Candle = null;

//   const buyAmount_BuyAndHold = accountBalanceUSD_BuyAndHold;
//   accountBalanceUSD_BuyAndHold = 0;
//   accountBalanceCOIN_BuyAndHold += (buyAmount_BuyAndHold / starting.close);
//   let startingTokenAmount = accountBalanceCOIN_BuyAndHold;
//   let prevRsiLow = false;
//   let prevRsiStochLow = false;
//   let maxLowSeenRecently: number = null;
//   for (let i = candles.length - startingIdx; i < candles.length - 1; i++) {

//     const candle = candles[i];
//     calculateRsi(candle);
//     calculateStochRsi(candle);
//     calculateStochRsiSmma(candle);
//     // console.log(candle.smma, 'current cost...', candle.close);

//     // either rsi top or a moon shot (> 30% gains)
//     if (candle.rsi >= 70 && candle.smma >= 80 && accountBalanceCOIN > 0.0 || ((candle.close > (maxLowSeenRecently * 1.3))) && accountBalanceCOIN > 0.0 ) {

//       lastOversoldCandle = candle;
//       // console.log('here');
//       // console.log(maxLowSeenRecently);
//       if ((lastOversoldCandle.close > maxLowSeenRecently) && (lastOversoldCandle.close > (maxLowSeenRecently * 1.005))) {

//         // if () {

//         // }
//       // if (lastOversoldCandle && lastUndersoldCandle) {

//         const sellAmount = accountBalanceCOIN;
//         const profit = sellAmount * lastOversoldCandle.close;
//         accountBalanceUSD += profit;
//         accountBalanceCOIN = 0.0;
//         console.log(`selling @ ${lastOversoldCandle.close}!, new account balance (USD): ${accountBalanceUSD}`);
        
//         // accountBalanceUSD_BuyAndHold -= buyAmount;
//         // accountBalanceCOIN = (buyAmount_BuyAndHold / lastOversoldCandle.close);
  
//         // const profit = lastOversoldCandle.close - lastUndersoldCandle.close;
//         // console.log(profit);
//         // profits += profit;
//         tradeCount++;
//         maxLowSeenRecently = 0;

//         // } else {
//         //   console.log('not enough coin ');
//         // }
//         // lastUndersoldCandle = null;
//         // lastOversoldCandle = null;

//       }



//     }

//     if ((candle.rsi >= 30 || candle.smma >= 20) && (prevRsiLow && prevRsiStochLow)) {
//       prevRsiStochLow = false;
//       prevRsiLow = false;

//       lastUndersoldCandle = candle;

//       const buyAmount = accountBalanceUSD * tradePercent;
//       // console.log('account balane', accountBalanceUSD);

//       if (accountBalanceUSD > buyAmount) {
//         console.log(`buying @ ${lastUndersoldCandle.close}! ${lastUndersoldCandle.timestamp} (rsi ${lastUndersoldCandle.rsi}), stoch smma ${lastUndersoldCandle.smma}, new account balance (USD): ${accountBalanceUSD}`);
//         accountBalanceUSD -= buyAmount;
//         accountBalanceCOIN += (buyAmount / lastUndersoldCandle.close);
//         maxLowSeenRecently = Math.max(maxLowSeenRecently, lastUndersoldCandle.close);
//       }
//     }

//     // if ( 
//     //   (candle.rsi > 30 && candle.stochRsi <= 20
//     //   && 
//     //   prevRsiLow && prevRsiStochLow)) {

//     //     prevRsiStochLow = false;
//     //     prevRsiLow = false;

//     //     lastUndersoldCandle = candle;

//     //     const buyAmount = accountBalanceUSD * tradePercent;
//     //     console.log('account balane', accountBalanceUSD);

//     //     if ( accountBalanceUSD > buyAmount) {
//     //       console.log('buying');
//     //       accountBalanceUSD -= buyAmount;
//     //       accountBalanceCOIN += (buyAmount / lastUndersoldCandle.close);
//     //     }
//     //   }


//     if (candle.rsi <= 30 && candle.smma <= 20) {
//       // console.log('setting lowest');
//       console.log(`low rsi: ${candle.rsi}, stoch: ${candle.smma}, stamp: ${candle.timestamp}`);
//       prevRsiLow = true;
//       prevRsiStochLow = true;

//       // console.log('undersold');
//     }


//   }

//   // const lastCandle = end;
//   // const sellAmount = accountBalanceCOIN;
//   // const profit = sellAmount * lastCandle.close;
//   // accountBalanceUSD += profit;
//   // accountBalanceCOIN = 0.0;

//   // const sellAmountBuyAndHold = accountBalanceCOIN_BuyAndHold;
//   // const profitBuyAndHold = sellAmountBuyAndHold * lastCandle.close;
//   // accountBalanceUSD_BuyAndHold += profitBuyAndHold;
//   // accountBalanceCOIN_BuyAndHold = 0.0;
//   console.log(`open out coin: ${starting.close}, close out coin: ${end.close}, vs ${startingTokenAmount}`);

//   console.log(`buy and hold: ${accountBalanceUSD_BuyAndHold} USD, ${accountBalanceCOIN_BuyAndHold} COIN`);
//   console.log(`daytrade: ${accountBalanceUSD} USD, ${accountBalanceCOIN} COIN`);
//   console.log('total trades', tradeCount);

//   // console.log(`buy and hold: ${end.open - starting.open}`);
//   // console.log(candles.length);
//   console.log(`Earned ${accountBalanceCOIN - accountBalanceCOIN_BuyAndHold} coin`);
//   console.log(`between ${starting.timestamp} and ${end.timestamp} there were ${tradeCount} trades`);

//   // const stopwatchStop = new Date().getUTCMilliseconds();
//   // console.log(`
//   //   Start: ${stopwatchStart}
//   //   End: ${stopwatchStop}
//   //   Elapsed time (ms): ${stopwatchStop - stopwatchStart}`);
// }

(async () => {
  try {
    await bootup();    
  } catch (e) {
    console.log('Error running app, dumping error');
    console.error(e);
  }
})();
