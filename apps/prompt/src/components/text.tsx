import React, { useEffect } from 'react';
import { Box, Text, useInput } from 'ink';

interface TextPromptProps {
  message: string;
  placeholder?: string;
}

export function TextPrompt({ message, placeholder }: TextPromptProps) {
  const { value, setValue, submit, state } = usePrompt<string>();

  useInput((input, key) => {
    if (key.return) {
      submit(value);
    } else if (key.backspace) {
      setValue(value.slice(0, -1));
    } else {
      setValue(value + input);
    }
  });

  return (
    <Box>
      <Text>{message} </Text>
      {state === 'submitted' ? (
        <Text color="cyan">{value}</Text>
      ) : (
        <Text color="gray">
          {value.length > 0 ? value : placeholder}
        </Text>
      )}
    </Box>
  );
}
