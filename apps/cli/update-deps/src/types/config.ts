export interface CheckOptions {
  cwd?: string;
  recursive?: boolean;
  write?: boolean;
  include?: string[];
  exclude?: string[];
  install?: boolean;
  update?: boolean;
  concurrency?: number;
  failOnOutdated?: boolean;
  includePeer?: boolean;
  includeLocked?: boolean;
  maturityPeriod?: number;
}
