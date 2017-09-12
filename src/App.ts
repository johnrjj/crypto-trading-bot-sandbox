import { BittrexRepository } from './repositories/bittrex';
import { BittrexAccount } from './accounts/bittrex';
import { Trader } from './trader/trader';
import { TicksContainer } from './types/ticker';
import { RsiStochRsiStrategy } from './strategies/rsi-stochrsi';
import { InterExchangeArbitrationStrategy } from './strategies/arb';

const refresh = async (x: any) => {
  await x.getLatestHistoryTicks();
  setTimeout(() => refresh(x), 1500);
};

const bootup = async () => {
  const repo = new BittrexRepository(
    BittrexRepository.availableCurrencyPairs.BTC_ETH,
    BittrexRepository.availableTickIntervals.ONE_HOUR
  );

  const account = new BittrexAccount();
  account.deposit('BTC', 1);

  const initialHistory = await repo.getTicks();

  const strat = new RsiStochRsiStrategy();
  // const arbStrat = new InterExchangeArbitrationStrategy();

  // const currentTicksOfAllCurrencyPairs = await repo.getMarketSummary();
  // arbStrat.run(currentTicksOfAllCurrencyPairs);

  const trader = new Trader(account);

  const currencyA = 'BTC';
  const currencyB = 'NEO';

  const foo = new TicksContainer('BTC-NEO-five', repo, currencyA, currencyB);
  foo.registerUpdate(newEntity => {
    // console.log('new ent', Object.keys(newEntity));
    try {
      const trades = strat.run(newEntity);
      trader.attemptTrades(trades);
    } catch (e) {
      console.log(e);
      throw e;
    }

    console.log(
      `Balances:
      \t${currencyA}: ${account.checkBalance(currencyA)}
      \t${currencyB}: ${account.checkBalance(
        currencyB
      )} (current price @ ${newEntity.pointer.close})
      [Estimated value: ${account.checkBalance(currencyA) +
        account.checkBalance(currencyB) * newEntity.pointer.close}]`
    );
    return {};
  });

  refresh(foo);
};

(async () => {
  try {
    await bootup();
  } catch (e) {
    console.log('Error running app, dumping error');
    console.error(e);
  }
})();
