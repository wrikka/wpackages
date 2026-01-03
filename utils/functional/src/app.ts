import { Effect } from 'effect';
import { Button } from './components';
import { log } from './services';
import { capitalize } from './utils';

const myApp = Effect.gen(function* (_) {
  const capitalizedLabel = capitalize('click me');
  const button = Button({ label: capitalizedLabel, onClick: () => Effect.runSync(log('Button clicked!')) });

  yield* _(log('App started'));
  yield* _(log(`Rendering button: ${button}`));
});

export const run = () => Effect.runPromise(myApp);
