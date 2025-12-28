import type { Command } from './index';

export interface Plugin {
  name: string;
  commands: Command[];
}
