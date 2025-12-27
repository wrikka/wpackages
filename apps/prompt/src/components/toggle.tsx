import React from 'react';
import { Box, Text, useInput } from 'ink';
import { usePrompt } from '@/context';

interface TogglePromptProps {
  message: string;
  active?: string;
  inactive?: string;
}

export function TogglePrompt({ message, active = 'On', inactive = 'Off' }: TogglePromptProps) {
  const { value, setValue, submit } = usePrompt<boolean>();

  useInput((input, key) => {
    if (key.return) {
      submit(value);
    } else if (key.leftArrow || key.rightArrow || input === ' ') {
      setValue(!value);
    }
  });

  const toggle = value
    ? `( ${active} )----`
    : `----( ${inactive} )`;

  return (
    <Box>
      <Text>{message} </Text>
      <Text color={value ? 'cyan' : 'gray'}>{toggle}</Text>
    </Box>
  );
}
