export type Option = {
  name: string; // e.g., --port
  shorthand?: string; // e.g., -p
  description?: string;
  defaultValue?: string | boolean | number;
  required?: boolean;
};

export type Hook = (args: Record<string, any>) => void | Promise<void>;

export type Command = {
  name: string;
  description?: string;
  options?: Option[];
  action?: (args: Record<string, any>) => void;
  subCommands?: Command[];
  before?: Hook;
  after?: Hook;
};

export type CliConfig = {
  name: string;
  version: string;
  commands: Command[];
  before?: Hook; // Global before hook
  after?: Hook;  // Global after hook
};