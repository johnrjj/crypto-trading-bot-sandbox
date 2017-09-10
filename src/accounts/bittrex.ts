import { Account } from '../types/account';
class BittrexAccount implements Account {
  balances: Map<string, number> = new Map();

  contructor() {}

  checkBalance(currencyName: string): number {
    if (this.balances.has(currencyName)) {
      return this.balances.get(currencyName);
    } else {
      return 0;
    }
  }

  withdrawl(currencyName: string, amountToWithdrawl: number) {
    if (this.checkBalance(currencyName) - amountToWithdrawl >= 0) {
      const oldBalance = this.checkBalance(currencyName);
      const newBalance = oldBalance - amountToWithdrawl;
      this.balances.set(currencyName, newBalance);
    } else {
      throw Error(`Insufficient funds for ${currencyName}`);
    }
  }

  deposit(currencyName: string, amount: number) {
    if (this.balances.has(currencyName)) {
      const previousBalance = this.balances.get(currencyName);
      const newBalance = previousBalance + amount;
      this.balances.set(currencyName, newBalance);
    } else {
      this.balances.set(currencyName, amount);
    }
  }
}

export { BittrexAccount };
