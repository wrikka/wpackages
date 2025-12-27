import React from 'react';
import { render, Instance } from 'ink';

class Renderer {
  private instance: Instance | null = null;

  public render(node: React.ReactElement): void {
    if (this.instance) {
      this.instance.rerender(node);
    } else {
      this.instance = render(node);
    }
  }

  public unmount(): void {
    this.instance?.unmount();
    this.instance = null;
  }

  public cleanup(): void {
    this.instance?.cleanup();
  }
}

export const renderer = new Renderer();
