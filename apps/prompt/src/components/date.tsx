import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { usePrompt } from '@/context';

interface DatePromptProps {
  message: string;
}

const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getDay = (year: number, month: number, day: number) => new Date(year, month, day).getDay();

export function DatePrompt({ message }: DatePromptProps) {
  const { submit } = usePrompt<Date>();
  const [currentDate, setCurrentDate] = useState(new Date());

  useInput((_, key) => {
    if (key.return) {
      submit(currentDate);
    } else {
      const newDate = new Date(currentDate);
      if (key.leftArrow) newDate.setDate(newDate.getDate() - 1);
      if (key.rightArrow) newDate.setDate(newDate.getDate() + 1);
      if (key.upArrow) newDate.setDate(newDate.getDate() - 7);
      if (key.downArrow) newDate.setDate(newDate.getDate() + 7);
      setCurrentDate(newDate);
    }
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const day = currentDate.getDate();

  const monthDays = daysInMonth(year, month);
  const firstDay = getDay(year, month, 1);

  const calendar = [];
  let week = Array(7).fill('  ');

  for (let i = 1; i <= monthDays; i++) {
    const dayIndex = (firstDay + i - 1) % 7;
    week[dayIndex] = i < 10 ? ` ${i}` : `${i}`;
    if (dayIndex === 6 || i === monthDays) {
      calendar.push(week);
      week = Array(7).fill('  ');
    }
  }

  return (
    <Box flexDirection="column">
      <Text>{message}</Text>
      <Text>{currentDate.toDateString()}</Text>
      <Box flexDirection="column" marginTop={1}>
        <Box><Text>Su Mo Tu We Th Fr Sa</Text></Box>
        {calendar.map((week, weekIndex) => (
          <Box key={weekIndex}>
            {week.map((d, dayIndex) => (
              <Text key={dayIndex} color={Number(d) === day ? 'cyan' : 'gray'}>
                {d}{' '}
              </Text>
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
