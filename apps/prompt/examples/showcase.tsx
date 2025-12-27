import React from 'react';
import { prompt } from '../src/context';
import {
  TextPrompt,
  ConfirmPrompt,
  SelectPrompt,
  MultiSelectPrompt,
  PasswordPrompt,
  NumberPrompt,
  SliderPrompt,
  TogglePrompt,
  RatingPrompt,
  DatePrompt,
  TimePrompt,
  Note,
  LoadingSpinner,
} from '../src/components';
import pc from 'picocolors';

async function main() {
  console.clear();

  await prompt(Note, { message: 'Welcome to the @wrikka/prompt showcase!' });

  const name = await prompt(TextPrompt, { message: 'What is your name?' }, '');

  const usePackage = await prompt(
    ConfirmPrompt,
    { message: `Nice to meet you, ${name}! Are you enjoying this library?` },
    true
  );

  if (!usePackage) {
    await prompt(Note, { message: 'Oh, that\'s a shame. Goodbye!', type: 'warning' });
    return;
  }

  const favoriteFeature = await prompt(
    SelectPrompt,
    {
      message: 'What is your favorite feature so far?',
      options: [
        { value: 'text', label: 'Text Input' },
        { value: 'confirm', label: 'Confirmation' },
        { value: 'select', label: 'Select Menu' },
      ],
    },
    'text'
  );

  const featuresToImprove = await prompt(
    MultiSelectPrompt,
    {
      message: 'Which features would you like to see improved? (Space to select, Enter to submit)',
      options: [
        { value: 'more-components', label: 'More Components' },
        { value: 'theming', label: 'Theming' },
        { value: 'performance', label: 'Performance' },
      ],
    },
    []
  );

  const age = await prompt(NumberPrompt, { message: 'How old are you?', min: 18, max: 99 }, 25);

  const satisfaction = await prompt(SliderPrompt, { message: 'How satisfied are you?', max: 10 }, 5);

  const enableNotifications = await prompt(TogglePrompt, { message: 'Enable notifications?' }, false);

  const projectRating = await prompt(RatingPrompt, { message: 'Rate this project (out of 5 stars)' }, 3);

  const releaseDate = await prompt(DatePrompt, { message: 'Pick a release date for your project' }, new Date());

  const meetingTime = await prompt(TimePrompt, { message: 'Schedule a follow-up meeting' }, new Date());

  await prompt(LoadingSpinner, { message: 'Saving your preferences...' });

  await prompt(Note, { message: 'All done! Thank you for your feedback.', type: 'success' });
}

main();
