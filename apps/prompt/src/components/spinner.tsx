import React from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';

interface SpinnerProps {
  message: string;
  type?: Spinner['type'];
}

export function LoadingSpinner({ message, type = 'dots' }: SpinnerProps) {
  return (
    <Box>
      <Text color="green">
        <Spinner type={type} />
      </Text>
      <Box marginLeft={1}>
        <Text>{message}</Text>
      </Box>
    </Box>
  );
}
