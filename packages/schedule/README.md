# schedule

A functional scheduling library with cron-like capabilities and advanced scheduling features.

## Features

- Functional programming approach with pure functions
- Cron expression parsing and validation
- Flexible scheduling configurations
- Type-safe APIs with Effect Schema
- Dependency injection with Effect TS

## Installation

```bash
bun add schedule
```

## Usage

```typescript
import { createScheduleDisplay, formatCronExpression } from 'schedule'

// Create a schedule display
const display = createScheduleDisplay({
  name: 'daily-backup',
  enabled: true,
  timezone: 'UTC'
})

console.log(display) // Schedule: daily-backup | Status: Enabled | Timezone: UTC

// Format a cron expression
const formatted = formatCronExpression('0 0 * * *')
console.log(formatted) // Runs at minute 0, at hour 0, every day, every month, every weekday
```

## API

### Components

- `createScheduleDisplay(config)`: Creates a display string for a schedule configuration
- `formatCronExpression(cron)`: Formats a cron expression into a human-readable string

### Types

- `CronExpression`: Type for cron expressions
- `Interval`: Type for schedule intervals
- `ScheduleConfig`: Type for schedule configurations

### Utilities

- `parseCronExpression(cron)`: Parses a cron expression into an interval
- `validateCronExpression(cron)`: Validates a cron expression

### Services

- `SchedulerService`: Service for managing scheduled tasks