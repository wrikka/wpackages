import { useStorage } from '@vueuse/core';

const DEFAULT_FONT_SIZE = 16;
const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 24;

export function useAppearance() {
  const fontSize = useStorage('appearance-font-size', DEFAULT_FONT_SIZE);

  const increaseFontSize = () => {
    if (fontSize.value < MAX_FONT_SIZE) {
      fontSize.value++;
    }
  };

  const decreaseFontSize = () => {
    if (fontSize.value > MIN_FONT_SIZE) {
      fontSize.value--;
    }
  };

  const resetFontSize = () => {
    fontSize.value = DEFAULT_FONT_SIZE;
  };

  watchEffect(() => {
    if (process.client) {
      document.documentElement.style.fontSize = `${fontSize.value}px`;
    }
  });

  return {
    fontSize,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
  };
}
