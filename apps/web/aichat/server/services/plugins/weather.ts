import type { Plugin } from './types';

async function getCurrentWeather(location: string) {
  if (location.toLowerCase().includes('tokyo')) {
    return { location: 'Tokyo', temperature: '15', unit: 'celsius', forecast: 'sunny' };
  }
  if (location.toLowerCase().includes('san francisco')) {
    return { location: 'San Francisco', temperature: '60', unit: 'fahrenheit', forecast: 'foggy' };
  }
  return { location, temperature: '25', unit: 'celsius', forecast: 'clear' };
}

export const weatherPlugin: Plugin = {
  name: 'WeatherPlugin',
  description: 'Provides current weather information.',
  tools: [
    {
      type: 'function',
      function: {
        name: 'get_current_weather',
        description: 'Get the current weather in a given location',
        parameters: {
          type: 'object',
          properties: {
            location: {
              type: 'string',
              description: 'The city and state, e.g. San Francisco, CA',
            },
          },
          required: ['location'],
        },
      },
    },
  ],
  execute: async (toolName, args) => {
    if (toolName === 'get_current_weather') {
      return getCurrentWeather(args.location);
    }
    throw new Error(`Tool "${toolName}" not found in WeatherPlugin.`);
  },
};
