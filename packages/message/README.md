# services-notification

Multi-channel notification service built with Effect-TS for the WTS framework. Send notifications through email, SMS, push, and in-app channels with type-safe, composable, and testable architecture.

## Features

- 🔔 **Multi-Channel Support** - Email, SMS, Push, and In-App notifications
- 🎯 **Type-Safe** - Full TypeScript support with Effect-TS
- 🧪 **Testable** - Built-in test implementations for easy testing
- 📝 **Template System** - Simple template engine for dynamic content
- 🛡️ **Validation & Sanitization** - Built-in content validation and XSS protection
- ⚡ **Batch Operations** - Send multiple notifications efficiently
- ⏰ **Scheduling** - Schedule notifications for later delivery
- 🔄 **Effect-TS Integration** - Composable effects for error handling

## Installation

```bash
bun add services-notification
```

## Quick Start

### Basic Email Notification

```typescript
import { Effect } from 'effect';
import {
  NotificationService,
  NotificationServiceLive,
  type EmailNotification,
} from 'services-notification';

const sendEmail = Effect.gen(function* () {
  const notification: EmailNotification = {
    channel: 'email',
    to: 'user@example.com',
    subject: 'Welcome!',
    body: 'Welcome to our platform!',
  };

  const service = yield* NotificationService;
  const result = yield* service.send(notification);
  
  console.log('Email sent:', result);
  return result;
});

// Run with live implementation
Effect.runPromise(
  Effect.provide(sendEmail, NotificationServiceLive)
);
```

### SMS Notification

```typescript
const sendSms = Effect.gen(function* () {
  const notification: SmsNotification = {
    channel: 'sms',
    to: '+1234567890',
    body: 'Your verification code is: 123456',
  };

  const service = yield* NotificationService;
  return yield* service.send(notification);
});
```

### Push Notification

```typescript
const sendPush = Effect.gen(function* () {
  const notification: PushNotification = {
    channel: 'push',
    to: 'device-token',
    title: 'New Message',
    body: 'You have a new message',
    icon: '/icon.png',
  };

  const service = yield* NotificationService;
  return yield* service.send(notification);
});
```

### In-App Notification

```typescript
const sendInApp = Effect.gen(function* () {
  const notification: InAppNotification = {
    channel: 'in-app',
    to: 'notification-system',
    userId: 'user-123',
    body: 'Your report is ready',
    actionUrl: '/reports/123',
  };

  const service = yield* NotificationService;
  return yield* service.send(notification);
});
```

## API Reference

### NotificationService

Main service interface for sending notifications.

#### Methods

- **`send(notification)`** - Send a single notification
- **`sendBatch(notifications)`** - Send multiple notifications in batch
- **`schedule(notification, scheduledAt)`** - Schedule a notification for later
- **`cancel(notificationId)`** - Cancel a scheduled notification
- **`getStatus(notificationId)`** - Get notification status

### Notification Types

#### EmailNotification

```typescript
interface EmailNotification {
  channel: 'email';
  to: string | readonly string[];
  subject?: string;
  body: string;
  from?: string;
  cc?: readonly string[];
  bcc?: readonly string[];
  attachments?: readonly {
    filename: string;
    content: string | Buffer;
  }[];
  priority?: NotificationPriority;
  template?: string;
  data?: Record<string, unknown>;
}
```

#### SmsNotification

```typescript
interface SmsNotification {
  channel: 'sms';
  to: string | readonly string[];
  body: string;
  from?: string;
  priority?: NotificationPriority;
}
```

#### PushNotification

```typescript
interface PushNotification {
  channel: 'push';
  to: string | readonly string[];
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  sound?: string;
  clickAction?: string;
  priority?: NotificationPriority;
}
```

#### InAppNotification

```typescript
interface InAppNotification {
  channel: 'in-app';
  to: string | readonly string[];
  userId: string;
  body: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  priority?: NotificationPriority;
}
```

## Advanced Usage

### Batch Sending

```typescript
const sendBatch = Effect.gen(function* () {
  const notifications: EmailNotification[] = [
    { channel: 'email', to: 'user1@example.com', body: 'Message 1' },
    { channel: 'email', to: 'user2@example.com', body: 'Message 2' },
    { channel: 'email', to: 'user3@example.com', body: 'Message 3' },
  ];

  const service = yield* NotificationService;
  const results = yield* service.sendBatch(notifications);
  
  console.log(`Sent ${results.length} notifications`);
  return results;
});
```

### Scheduling Notifications

```typescript
const scheduleNotification = Effect.gen(function* () {
  const notification: EmailNotification = {
    channel: 'email',
    to: 'user@example.com',
    subject: 'Reminder',
    body: 'This is your scheduled reminder',
  };

  const scheduledAt = new Date(Date.now() + 3600000); // 1 hour later

  const service = yield* NotificationService;
  const result = yield* service.schedule(notification, scheduledAt);
  
  console.log('Scheduled:', result);
  return result;
});
```

### Template System

```typescript
import { renderTemplate } from 'services-notification';

const useTemplate = Effect.gen(function* () {
  const template = 'Hello {{name}}, your order {{orderId}} is {{status}}!';
  const data = {
    name: 'John Doe',
    orderId: 'ORD-123',
    status: 'confirmed',
  };

  const body = yield* renderTemplate(template, data);
  // Result: "Hello John Doe, your order ORD-123 is confirmed!"

  const notification: EmailNotification = {
    channel: 'email',
    to: 'john@example.com',
    subject: 'Order Confirmation',
    body,
  };

  const service = yield* NotificationService;
  return yield* service.send(notification);
});
```

### Validation & Sanitization

```typescript
import { validateAndSanitize } from 'services-notification';

const sendSafe = Effect.gen(function* () {
  const unsafeNotification: EmailNotification = {
    channel: 'email',
    to: 'user@example.com',
    subject: 'Alert <script>alert("xss")</script>',
    body: 'Click here: <a href="javascript:void(0)">Link</a>',
  };

  // Validate and remove potentially dangerous content
  const safeNotification = yield* validateAndSanitize(unsafeNotification);

  const service = yield* NotificationService;
  return yield* service.send(safeNotification);
});
```

### Error Handling

```typescript
const withErrorHandling = Effect.gen(function* () {
  const notification: EmailNotification = {
    channel: 'email',
    to: 'invalid-email', // This will fail validation
    body: 'Test',
  };

  const service = yield* NotificationService;
  const result = yield* Effect.either(service.send(notification));

  if (result._tag === 'Left') {
    console.log('Failed:', result.left.message);
    // Handle error
  } else {
    console.log('Success:', result.right);
  }
});
```

## Testing

Use the test implementation for easy testing:

```typescript
import {
  NotificationService,
  NotificationServiceTest,
  makeTestNotificationService,
} from 'services-notification';

describe('My Notification Tests', () => {
  it('should send notification', async () => {
    const ctx = await Effect.runPromise(makeTestNotificationService());

    const notification: EmailNotification = {
      channel: 'email',
      to: 'test@example.com',
      body: 'Test',
    };

    // Send notification
    await Effect.runPromise(ctx.service.send(notification));

    // Verify it was sent
    const sent = await Effect.runPromise(ctx.getSent);
    expect(sent).toHaveLength(1);
    expect(sent[0].notification.to).toBe('test@example.com');
  });
});
```

## Utilities

### Template Utils

- `renderTemplate(template, data)` - Render template with data
- `validateTemplate(template)` - Validate template syntax

### Validation Utils

- `validateEmail(email)` - Validate email address
- `validatePhoneNumber(phone)` - Validate phone number
- `validateNotification(notification)` - Validate notification based on channel
- `sanitizeContent(content)` - Remove potentially dangerous HTML/JS
- `validateAndSanitize(notification)` - Validate and sanitize in one step

## Error Types

```typescript
class NotificationError {
  reason: 
    | 'InvalidChannel'
    | 'SendFailed'
    | 'TemplateNotFound'
    | 'InvalidRecipient'
    | 'Unknown';
  message?: string;
}
```

## Priority Levels

```typescript
type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
```

## License

MIT

## Author

Wrikka
