import { calculateRsiFirst, calculateRsiSubsequent } from './rsi';


const closings = [
  44.34,
  44.09,
  44.15,
  43.61,
  44.33,
  44.83,
  45.10,
  45.42,
  45.84,
  46.08,
  45.89,
  46.03,
  45.61,
  46.28,
];

const diff = closings.map((cur, idx, arr) => {
  const prev = arr[idx - 1] || cur;
  const change =  cur - prev;
  return change;
});

test('adds 1 + 2 to equal 3', () => {
  const { rsi } = calculateRsiFirst(diff);
  expect(rsi).toBe(70.46413502109705);
});