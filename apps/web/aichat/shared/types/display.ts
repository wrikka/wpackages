import type { BoundingBox } from './agent';

export interface DisplayDevice {
  id: string;
  name: string;
  bounds: BoundingBox;
  isPrimary: boolean;
}
