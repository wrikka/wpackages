import React from 'react';
import { Box, Text, useInput } from 'ink';
import { usePrompt } from '@/context';

interface SliderPromptProps {
  message: string;
  min?: number;
  max?: number;
  step?: number;
  barWidth?: number;
}

export function SliderPrompt({
  message,
  min = 0,
  max = 100,
  step = 1,
  barWidth = 20,
}: SliderPromptProps) {
  const { value, setValue, submit } = usePrompt<number>();

  useInput((_, key) => {
    if (key.return) {
      submit(value);
    } else if (key.rightArrow) {
      const newValue = Math.min(value + step, max);
      setValue(newValue);
    } else if (key.leftArrow) {
      const newValue = Math.max(value - step, min);
      setValue(newValue);
    }
  });

  const percentage = ((value - min) / (max - min)) * 100;
  const filledWidth = Math.round((percentage / 100) * barWidth);
  const emptyWidth = barWidth - filledWidth;

  const bar = '█'.repeat(filledWidth) + '─'.repeat(emptyWidth);

  return (
    <Box>
      <Text>{message} </Text>
      <Text>[`</Text>
      <Text color="cyan">{bar}</Text>
      <Text>`] </Text>
      <Text color="cyan">{value}</Text>
    </Box>
  );
}
