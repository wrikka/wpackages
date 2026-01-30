import * as p from '@clack/prompts';
import { DEFAULT_BUILD, DEFAULT_HIDE_MENU_BAR, DEFAULT_RESIZABLE, DEFAULT_WINDOW_HEIGHT, DEFAULT_WINDOW_WIDTH } from '../constant/defaults';
import { validateUrl } from '../utils/validation.utils';

export const getAppConfigFromCli = async () => {
  const options = await p.group(
    {
      url: () =>
        p.text({
          message: 'Website URL:',
          placeholder: 'https://example.com',
          validate: (v) => (validateUrl(v) ? undefined : 'Invalid URL'),
        }),
      name: () =>
        p.text({
          message: 'App name:',
          placeholder: 'My App',
        }),
      width: () =>
        p.text({
          message: 'Window width:',
          placeholder: String(DEFAULT_WINDOW_WIDTH),
        }),
      height: () =>
        p.text({
          message: 'Window height:',
          placeholder: String(DEFAULT_WINDOW_HEIGHT),
        }),
      resizable: () =>
        p.confirm({
          message: 'Resizable window?',
          initialValue: DEFAULT_RESIZABLE,
        }),
      hideMenuBar: () =>
        p.confirm({
          message: 'Hide menu bar?',
          initialValue: DEFAULT_HIDE_MENU_BAR,
        }),
      build: () =>
        p.confirm({
          message: 'Build app after generation?',
          initialValue: DEFAULT_BUILD,
        }),
    },
    {
      onCancel: () => {
        p.cancel('Operation cancelled.');
        process.exit(0);
      },
    },
  );

  return {
    ...options,
    width: Number(options.width) || DEFAULT_WINDOW_WIDTH,
    height: Number(options.height) || DEFAULT_WINDOW_HEIGHT,
  };
};
