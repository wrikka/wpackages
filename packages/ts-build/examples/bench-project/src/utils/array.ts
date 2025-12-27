import { chunk } from 'lodash-es';

export function chunkArray<T>(arr: T[], size: number): T[][] {
  return chunk(arr, size);
}
