import React from 'react';
import { Box, Text } from 'ink';

interface NoteProps {
  title?: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

const typeConfig = {
  info: { color: 'blue', symbol: 'ℹ' },
  success: { color: 'green', symbol: '✔' },
  warning: { color: 'yellow', symbol: '⚠' },
  error: { color: 'red', symbol: '✖' },
};

export function Note({ title, message, type = 'info' }: NoteProps) {
  const { color, symbol } = typeConfig[type];

  return (
    <Box borderStyle="round" borderColor={color} paddingX={1} flexDirection="column">
      <Box>
        <Text color={color}>{symbol} </Text>
        {title && <Text bold>{title}</Text>}
      </Box>
      <Text>{message}</Text>
    </Box>
  );
}
