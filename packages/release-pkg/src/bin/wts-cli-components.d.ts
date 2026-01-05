declare module "@wts/cli-components" {
  export function select(options: {
    message: string;
    options: { value: string; label: string }[];
  }): Promise<string>;

  export function confirm(options: {
    message: string;
    initialValue?: boolean;
  }): Promise<boolean>;

  export function input(options: {
    message: string;
    initialValue?: string;
  }): Promise<string>;
}
