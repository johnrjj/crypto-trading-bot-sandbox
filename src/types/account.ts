interface Account {
  [currency: string]: any;
  checkBalance(currencyName: string): number;
  withdrawl(currencyName: string, amountToWithdrawl: number);
  deposit(currencyName: string, amount: number);
}

export { Account };
