import { Prompt } from '@/app';
import { KEYS } from '@/constant';
import { TextPromptOptions } from '@/types';

export class TextPrompt extends Prompt<string, TextPromptOptions> {
  constructor(options: TextPromptOptions) {
    super({
      ...options,
      initialValue: options.initialValue ?? '',
    });
  }

  protected handleKey(key: string): void {
    if (key === KEYS.ENTER) {
      this.state = 'submit';
    } else if (key === KEYS.BACKSPACE) {
      this.value = this.value.slice(0, -1);
    } else if (key >= ' ' && key <= '~') { // Printable characters
      this.value += key;
    }
  }

  protected render(): void {
    this.renderer.clearScreen();

    const message = this.theme.message(this.options.message);
    let inputText = this.value;

    if (this.state === 'initial' || this.state === 'active') {
      if (!this.value && this.options.placeholder) {
        inputText = this.theme.placeholder(this.options.placeholder);
      } else {
        inputText = this.theme.value(this.value);
      }
      this.renderer.write(`${message} ${inputText}${this.theme.cursor(this.theme.value('_'))}`);
    } else if (this.state === 'submit') {
      this.renderer.write(`${message} ${this.theme.value(this.value)}\n`);
    } else if (this.state === 'error') {
      const errorMessage = this.theme.error(this.error);
      this.renderer.write(`${message} ${this.theme.value(this.value)} ${errorMessage}\n`);
    }
  }
}

export const text = (options: TextPromptOptions) => new TextPrompt(options).run();
