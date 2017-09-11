import axios from 'axios';
import { Repository } from '../types/repository';
import { Tick, CurrentTick, HistoryTick } from '../types/tick';

const baseUrlV1dot1 = 'https://bittrex.com/api/v1.1';
const baseUrlV2 = 'https://bittrex.com/Api/v2.0';

interface BittrexApiResponse {
  success: boolean;
  message: string;
  result: any;
}

interface BittrexCurrentTickResponse {
  Bid: number;
  Ask: number;
  Last: number;
}

interface BittrexHistoryTickResponse {
  T: string;
  O: number;
  H: number;
  L: number;
  C: number;
  V: number;
  BV: number;
}

interface BittrexMarketSummaryResponse {
  MarketName: string;
  High: number;
  Low: number;
  Volume: number;
  Last: number;
  BaseVolume: number;
  TimeStamp: string;
  Bid: number;
  Ask: number;
  OpenBuyOrders: number;
  OpenSellOrders: number;
  PrevDay: number;
  Created: string;
}

enum availableCurrencyPairs {
  BTC_ETH = 'BTC-ETH',
  USDT_BTC = 'USDT-BTC',
  ETH_BTC = 'ETH-BTC',
  BTC_NEO = 'BTC-NEO',
  BTC_ARK = 'BTC-ARK',
  BTC_SYS = 'BTC-SYS',
}

enum availableTickIntervals {
  ONE_MINUTE = 'oneMin',
  FIVE_MINUTES = 'fiveMin',
  THIRTY_MINUTES = 'thirtyMin',
  ONE_HOUR = 'hour',
  ONE_DAY = 'day',
}

const buildTicksUrl = (
  currencyPair: availableCurrencyPairs,
  tickInterval: availableTickIntervals
) => {
  return `${baseUrlV2}/pub/market/GetTicks?marketName=${currencyPair}&tickInterval=${tickInterval}`;
};

const buildTickUrl = (currencyPair: availableCurrencyPairs) => {
  return `${baseUrlV1dot1}/public/getticker?market=${currencyPair}`;
};

// https://bittrex.com/api/v1.1/public/getmarketsummaries
const buildMarketSummaryUrl = () =>
  `${baseUrlV1dot1}/public/getmarketsummaries`;

const getBittrex = async (url: string) => {
  const res = await axios.get(url);
  const resJson: BittrexApiResponse = res.data;
  const { success, message, result } = resJson;
  if (success === false) {
    throw new Error(`Error querying Bittrex API ${url}:\n${message}`);
  }
  return result;
};

const convertBittrexHistoryTickToDomain = (b: BittrexHistoryTickResponse) => {
  const ht: HistoryTick = {
    timestamp: b.T,
    open: b.O,
    close: b.C,
    high: b.H,
    low: b.L,
    volume: b.V,
    baseVolume: b.BV,
    previous: null,
    next: null,
  };
  return ht;
};

const convertBittrexCurrentTickToDomain = (b: BittrexCurrentTickResponse) => {
  const ct: CurrentTick = {
    bid: b.Bid,
    ask: b.Ask,
    last: b.Last,
    next: null,
    previous: null,
  };
};

const convertBittrexMarketSummaryToDomain = (
  b: BittrexMarketSummaryResponse
) => {
  const t: CurrentTick = {
    marketName: b.MarketName,
    high: b.High,
    low: b.Low,
    volume: b.Volume,
    last: b.Last,
    baseVolume: b.BaseVolume,
    timeStamp: b.TimeStamp,
    bid: b.Bid,
    ask: b.Ask,
    openBuyOrders: b.OpenBuyOrders,
    openSellOrders: b.OpenSellOrders,
    prevDay: b.PrevDay,
    created: b.Created,
    previous: null,
    next: null,
  };
  return t;
};

class BittrexRepository implements Repository {
  static availableCurrencyPairs = availableCurrencyPairs;
  static availableTickIntervals = availableTickIntervals;
  currencyPair: availableCurrencyPairs;
  tickInterval: availableTickIntervals;
  constructor(
    currencyPair: availableCurrencyPairs,
    tickInterval: availableTickIntervals
  ) {
    this.currencyPair = currencyPair;
    this.tickInterval = tickInterval;
  }

  async getTicks(
    currencyPair: availableCurrencyPairs = this.currencyPair,
    tickInterval: availableTickIntervals = this.tickInterval
  ) {
    // https://bittrex.com/Api/v2.0/pub/market/GetTicks?marketName=USDT-BTC&tickInterval=fiveMin&_=1499128220008
    const url = buildTicksUrl(currencyPair, tickInterval);
    // console.log(url);
    const res: Array<BittrexHistoryTickResponse> = await getBittrex(url);
    const historyTicks = res.map(convertBittrexHistoryTickToDomain);
    return historyTicks;
  }

  async getMarketSummary() {
    const url = buildMarketSummaryUrl();
    const res: Array<BittrexMarketSummaryResponse> = await getBittrex(url);
    const marketSummary: Array<CurrentTick> = res.map(
      convertBittrexMarketSummaryToDomain
    );
    return marketSummary;
  }

  async getCurrentTick(
    currencyPair: availableCurrencyPairs = this.currencyPair
  ) {
    throw Error('not yet implemented');
    // const url = buildTickUrl(currencyPair);
    // const res: BittrexCurrentTickResponse = await getBittrex(url);
    // return res;
  }
}

export { BittrexRepository };
