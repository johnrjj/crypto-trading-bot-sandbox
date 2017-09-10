import { last } from 'lodash';
import { RsiStochRsiStrategy } from './rsi-stochrsi';
import { TicksContainer } from '../types/ticker';
import { HistoryTick } from '../types/tick';

const closes: Array<number> = [
  46.125,
  47.125,
  46.4375,
  46.9375,
  44.9375,
  44.25,
  44.625,
  45.75,
  47.8125,
  47.5625,
  47.0,
  44.5625,
  46.3125,
  47.6875,
  46.6875,
  45.6875,
  43.0625,
];

const createMockTick = (close: number): HistoryTick => {
  const foo: HistoryTick = {
    close,
    timestamp: '',
    open: NaN,
    high: NaN,
    low: NaN,
    volume: NaN,
    baseVolume: NaN,
    next: null,
    previous: null,
  };
  return foo;
};

const ticks = closes.map(createMockTick);
ticks.forEach((t, idx, arr) => {
  const prev = arr[idx - 1] || null;
  const next = arr[idx + 1] || null;
  t.previous = prev;
  t.next = next;
});

const strategy = new RsiStochRsiStrategy();
const rsiArr = ticks.map((t, idx) => {
  const rsi = strategy.getRsi(t);
  return rsi;
});

test('first entry shouldnt calc', () => {
  expect(rsiArr[0]).toBe(null);
});

test('entry before first calc shouldnt calc', () => {
  expect(rsiArr[13]).toBe(null);
});

test('first calc', () => {
  expect(+rsiArr[14].toFixed(3)).toBe(51.779);
});

test('second (subsequent) calc', () => {
  expect(+rsiArr[15].toFixed(3)).toBe(48.477);
});

test('third (subsequent) calc', () => {
  expect(+rsiArr[16].toFixed(3)).toBe(41.073);
});
