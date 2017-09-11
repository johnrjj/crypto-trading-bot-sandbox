import { Account } from '../types/account';
import { Trade, TradeType } from '../types/trade';

class Trader {
  account: Account;
  tradeCount: number = 0;
  tradePercent: number = 0.3;
  minimumTradeAmount: number = 0.000001;
  constructor(account: Account) {
    this.account = account;
  }

  attemptTrades(trades: Array<Trade>) {
    if (trades === null || trades.filter(x => x !== null).length === 0) {
      return;
    }
    // console.log(`New trades incoming!`, trades);

    trades.forEach(trade => {
      const currencyA = trade.currencyA;
      const currencyB = trade.currencyB;

      const currentPrice = trade.currentPrice;

      // console.log(`A: ${currencyA}, B: ${currencyB}, Price: ${currentPrice}`);

      if (trade.type === TradeType.BUY) {
        const currencyABalance = this.account.checkBalance(currencyA);
        const amountToBuyInCurrencyA = currencyABalance * this.tradePercent;
        const amountGettingInCurrencyB = amountToBuyInCurrencyA / currentPrice;
        // console.log(`spending ${amountToBuyInCurrencyA} to get ${amountGettingInCurrencyB} (@ ${currentPrice}`);

        const haveEnoughCurrencyAToExecuteTrade =
          this.account.checkBalance(currencyA) >= amountToBuyInCurrencyA;
        if (
          haveEnoughCurrencyAToExecuteTrade &&
          amountToBuyInCurrencyA > this.minimumTradeAmount
        ) {
          this.account.withdrawl(currencyA, amountToBuyInCurrencyA);
          this.account.deposit(currencyB, amountGettingInCurrencyB);
          console.log(
            `Buying ${currencyB} @ ${currentPrice}, new balance of ${currencyA}: ${this.account.checkBalance(
              currencyA
            )}\t${currencyB}: ${this.account.checkBalance(currencyB)}`
          );
        }

        // buy b
      } else if (trade.type === TradeType.SELL) {
        const hasFundsToSell = this.account.checkBalance(currencyB) > 0;
        if (hasFundsToSell) {
          // console.log(
          //   `currently holding ${this.account.checkBalance(
          //     currencyB
          //   )} of ${currencyB}`
          // );
          const withdrawlAmountOfCurrencyB = this.account.checkBalance(
            currencyB
          );

          this.account.withdrawl(currencyB, withdrawlAmountOfCurrencyB);
          const depositAmountofCurrencyA =
            withdrawlAmountOfCurrencyB * currentPrice;
          this.account.deposit(currencyA, depositAmountofCurrencyA);
          console.log(
            `Selling all of ${currencyB} @ ${currentPrice}, new balance of ${currencyA}: ${this.account.checkBalance(
              currencyA
            )}`
          );
        }
      }
    });
  }
}

//       const buyAmount = accountBalanceUSD * tradePercent;
//       // console.log('account balane', accountBalanceUSD);

//       if (accountBalanceUSD > buyAmount) {
//         console.log(`buying @ ${lastUndersoldCandle.close}! ${lastUndersoldCandle.timestamp} (rsi ${lastUndersoldCandle.rsi}), stoch smma ${lastUndersoldCandle.smma}, new account balance (USD): ${accountBalanceUSD}`);
//         accountBalanceUSD -= buyAmount;
//         accountBalanceCOIN += (buyAmount / lastUndersoldCandle.close);
//         maxLowSeenRecently = Math.max(maxLowSeenRecently, lastUndersoldCandle.close);
//       }

// const sellAmount = accountBalanceCOIN;
// const profit = sellAmount * lastOversoldCandle.close;
// accountBalanceUSD += profit;
// accountBalanceCOIN = 0.0;
// console.log(`selling @ ${lastOversoldCandle.close}!, new account balance (USD): ${accountBalanceUSD}`);

// // accountBalanceUSD_BuyAndHold -= buyAmount;
// // accountBalanceCOIN = (buyAmount_BuyAndHold / lastOversoldCandle.close);

// // const profit = lastOversoldCandle.close - lastUndersoldCandle.close;
// // console.log(profit);
// // profits += profit;
// tradeCount++;
// maxLowSeenRecently = 0;

export { Trader };
