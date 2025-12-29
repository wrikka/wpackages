const merge = <T>(left: T[], right: T[]): T[] => {
  const result: T[] = [];
  let leftIndex = 0;
  let rightIndex = 0;

  while (leftIndex < left.length && rightIndex < right.length) {
    const leftElement = left[leftIndex];
    const rightElement = right[rightIndex];

    if (leftElement !== undefined && rightElement !== undefined) {
      if (leftElement !== null && rightElement !== null && leftElement < rightElement) {
        result.push(leftElement);
        leftIndex++;
      } else {
        result.push(rightElement);
        rightIndex++;
      }
    } else if (leftElement !== undefined) {
      result.push(leftElement);
      leftIndex++;
    } else if (rightElement !== undefined) {
      result.push(rightElement);
      rightIndex++;
    }
  }

  return result.concat(left.slice(leftIndex)).concat(right.slice(rightIndex));
};

export const mergeSort = <T>(array: T[]): T[] => {
  if (array.length <= 1) {
    return array;
  }

  const middle = Math.floor(array.length / 2);
  const left = array.slice(0, middle);
  const right = array.slice(middle);

  return merge(mergeSort(left), mergeSort(right));
};
