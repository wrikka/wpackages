export interface Rule {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly condition: (context: unknown) => boolean;
  readonly action: (context: unknown) => Promise<void>;
}

export interface RuleEngine {
  readonly addRule: (rule: Rule) => void;
  readonly removeRule: (id: string) => void;
  readonly execute: (context: unknown) => Promise<void>;
  readonly listRules: () => Rule[];
}
