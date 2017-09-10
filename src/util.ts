import { reverse } from 'lodash';

// should next/prev be generics?
interface LinkedListLike<T> {
  next: T;
  previous: T;
}

const getNPrevious = <T extends LinkedListLike<T>>(
  current: T,
  numberToRetrieve: number,
  includeSelf: boolean = false
): Array<T> => {
  let pointer = current;
  let accum = [];
  let counter = includeSelf ? numberToRetrieve - 1 : numberToRetrieve;
  if (includeSelf) {
    accum.push(pointer);
  }
  while (counter > 0 && pointer && pointer.previous !== null) {
    accum.push(pointer.previous);
    pointer = pointer.previous;
    counter--;
  }
  return reverse(accum);
};

export { getNPrevious };
