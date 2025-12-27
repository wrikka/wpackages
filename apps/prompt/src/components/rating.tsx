import React from 'react';
import { Box, Text, useInput } from 'ink';
import { usePrompt } from '@/context';

interface RatingPromptProps {
  message: string;
  max?: number;
  character?: string;
}

export function RatingPrompt({ message, max = 5, character = '★' }: RatingPromptProps) {
  const { value, setValue, submit } = usePrompt<number>();

  useInput((_, key) => {
    if (key.return) {
      submit(value);
    } else if (key.rightArrow) {
      setValue(Math.min(value + 1, max));
    } else if (key.leftArrow) {
      setValue(Math.max(value - 1, 0));
    }
  });

  const stars = Array.from({ length: max }, (_, i) => {
    const isFilled = i < value;
    return <Text key={i} color={isFilled ? 'yellow' : 'gray'}>{character}</Text>;
  });

  return (
    <Box>
      <Text>{message} </Text>
      {stars}
    </Box>
  );
}
