export type PromptState = 'initial' | 'active' | 'submit' | 'cancel' | 'error';

export interface BasePromptOptions<T> {
  message: string;
  initialValue?: T;
  validate?: (value: T) => string | void;
}

export interface TextPromptOptions extends BasePromptOptions<string> {
  placeholder?: string;
}

// We will add more component-specific options here later
