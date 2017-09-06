import { reverse } from 'lodash';

interface LinkedListLike {
  next: any;
  previous: any;
}

const getNPrevious = <T extends LinkedListLike>(current: T, numberToRetrieve: number): Array<T> => {
  let pointer = current;
  let accum = [];
  let counter = numberToRetrieve;
  while (counter > 0 && pointer !== null && pointer.previous !== null) {
    accum.push(pointer.previous);
    pointer = pointer.previous;
    counter--;
  }
  return reverse(accum);
}

export {
  getNPrevious,
}