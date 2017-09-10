import axios from 'axios';
import { Repository } from '../types/repository';
import { HistoryTick } from '../types/tick';

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

enum availableCurrencyPairs {
  BTC_ETH = 'BTC-ETH',
  USDT_BTC = 'USDT-BTC',
  ETH_BTC = 'ETH-BTC',
  BTC_NEO = 'BTC-NEO',
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
    const res: Array<BittrexHistoryTickResponse> = await getBittrex(url);
    const historyTicks = res.map(convertBittrexHistoryTickToDomain);
    return historyTicks;
  }

  async getCurrentTick(
    currencyPair: availableCurrencyPairs = this.currencyPair
  ) {
    const url = buildTickUrl(currencyPair);
    const res: BittrexCurrentTickResponse = await getBittrex(url);
    return res;
  }
}

export { BittrexRepository };
