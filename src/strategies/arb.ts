import { Strategy } from '../types/strategy';
import { CurrentTick } from '../types/tick';
import { maxBy } from 'lodash';

class InterExchangeArbitrationStrategy implements Strategy {
  run(allCurrentValuesOfCurrencies: Array<CurrentTick>) {
    // console.log(allCurrentValuesOfCurrencies.length);
    // console.log(allCurrentValuesOfCurrencies);

    let combos = 0;
    const startingUSDT: number = 100.0;

    const possibleStartingCurrencies = allCurrentValuesOfCurrencies.filter(
      currencyPair => {
        return (
          currencyPair.marketName && currencyPair.marketName.startsWith('USDT')
        );
      }
    );

    // const possibleEndingCurrencies = allCurrentValuesOfCurrencies.filter(currencyPair => {
    //   return currencyPair.marketName && currencyPair.marketName.endsWith('USDT');
    // });

    // console.log(possibleEndingCurrencies.length);
    let workingArbs = [];

    const aCurrencyName = 'USDT';
    possibleStartingCurrencies.forEach(firstCurrencyPair => {
      const amountConvertedToB: number =
        startingUSDT / firstCurrencyPair.ask * 0.9975;
      possibleStartingCurrencies.forEach(secondCurrencyPair => {
        // console.log(`first currency: ${firstCurrencyPair.marketName}, second: ${secondCurrencyPair.marketName}`);
        combos++;
        const bCurrencyName = firstCurrencyPair.marketName.split('-')[1];
        const cCurrencyName = secondCurrencyPair.marketName.split('-')[1];
        const firstAttempt = `${bCurrencyName}-${cCurrencyName}`;
        let currencyPairBToC = allCurrentValuesOfCurrencies.find(
          currencyPair => {
            return currencyPair.marketName === firstAttempt;
          }
        );

        let amountConvertedToC = 0;

        if (currencyPairBToC) {
          amountConvertedToC =
            amountConvertedToB / currencyPairBToC.ask * 0.9975;
        } else {
          const secondAttempt = `${cCurrencyName}-${bCurrencyName}`;
          currencyPairBToC = allCurrentValuesOfCurrencies.find(currencyPair => {
            return currencyPair.marketName === secondAttempt;
          });
          if (!currencyPairBToC) {
            console.log(`couldn't find ${secondAttempt} or ${firstAttempt}`);
            return;
          }
          amountConvertedToC =
            amountConvertedToB * currencyPairBToC.bid * 0.9975;
        }

        if (amountConvertedToC === 0) return;

        const currencyPairCtoA = allCurrentValuesOfCurrencies.find(x => {
          return x.marketName === `USDT-${cCurrencyName}`;
        });
        const amountConvertedToA =
          currencyPairCtoA.ask * amountConvertedToC * 0.9975;

        // console.log(amountConvertedToA);
        workingArbs.push({
          description: `${aCurrencyName} -> ${bCurrencyName} -> ${cCurrencyName} -> ${aCurrencyName} => ${amountConvertedToA} ${aCurrencyName}`,

          final: amountConvertedToA,
          first: firstCurrencyPair,
          second: currencyPairBToC,
          third: currencyPairCtoA,
          aCurrencyName,
          bCurrencyName,
          cCurrencyName,
        });

        // console.log(currencyPairBToC);
        // allCurrentValuesOfCurrencies.find()
        // const amountConvertedToC: number = (amountConvertedToB / currencyPair.ask) * 0.9975;
        // const amountBackToUSDT: number =
      });
    });
    console.log('Reading tickers...');
    console.log('Simulating interexchange arb starting with $100 USDT\n');
    workingArbs.forEach(x => {
      if (x.final < 100) return;
      console.log(x.description);
      console.log(`${x.aCurrencyName}-${x.bCurrencyName}: ${x.first.ask}`);
      console.log(`${x.bCurrencyName}-${x.cCurrencyName}: ${x.second.ask}`);
      console.log(`${x.cCurrencyName}-${x.aCurrencyName}: ${x.third.ask}\n`);
    });

    const winner = maxBy(workingArbs, x => x.final);
    const percentDiff =
      Math.abs(100 - winner.final) / ((100 + winner.final) / 2) * 100;
    console.log(`\nWinner: ${winner.description}`);
    console.log(
      `${winner.aCurrencyName}-${winner.bCurrencyName}: ${winner.first.ask}`
    );
    console.log(
      `${winner.bCurrencyName}-${winner.cCurrencyName}: ${winner.second.ask}`
    );
    console.log(
      `${winner.cCurrencyName}-${winner.aCurrencyName}: ${winner.third.ask}`
    );

    // console.log(combos);
  }
}

export { InterExchangeArbitrationStrategy };
