enum TradeType {
  BUY = 'BUY',
  SELL = 'SELL',
};

interface Trade {
  type: TradeType,
  currencyA: string,
  currencyB: string,
  currentPrice: number;
}

export {
  TradeType,
  Trade,
}