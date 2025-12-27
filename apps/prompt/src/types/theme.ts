import type { Style } from 'picocolors/types';

export interface Theme {
  message: Style;
  placeholder: Style;
  value: Style;
  cursor: Style;
  error: Style;
  info: Style;
}
