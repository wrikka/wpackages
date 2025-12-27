import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { usePrompt } from '@/context';

interface Option<T> {
  value: T;
  label: string;
  hint?: string;
}

interface MultiSelectPromptProps<T> {
  message: string;
  options: Option<T>[];
}

export function MultiSelectPrompt<T>({ message, options }: MultiSelectPromptProps<T>) {
  const { submit } = usePrompt<T[]>();
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedValues, setSelectedValues] = useState<T[]>([]);

  useInput((input, key) => {
    if (key.return) {
      submit(selectedValues);
    } else if (key.upArrow) {
      setActiveIndex(prev => (prev > 0 ? prev - 1 : options.length - 1));
    } else if (key.downArrow) {
      setActiveIndex(prev => (prev < options.length - 1 ? prev + 1 : 0));
    } else if (input === ' ') {
      const currentValue = options[activeIndex].value;
      const newSelectedValues = selectedValues.includes(currentValue)
        ? selectedValues.filter(v => v !== currentValue)
        : [...selectedValues, currentValue];
      setSelectedValues(newSelectedValues);
    }
  });

  return (
    <Box flexDirection="column">
      <Text>{message}</Text>
      {options.map((option, index) => {
        const isSelected = selectedValues.includes(option.value);
        const isActive = activeIndex === index;
        return (
          <Box key={option.label}>
            <Text color={isActive ? 'cyan' : 'gray'}>
              {isActive ? '❯' : ' '} {isSelected ? '◉' : '◯'} {option.label}
            </Text>
            {option.hint && (
              <Text color="gray"> ({option.hint})</Text>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
