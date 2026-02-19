# Task Management 📋

## Introduction

Task Management is a lightweight TypeScript library for managing tasks with status tracking. It provides a simple, type-safe way to create, update, and track tasks throughout their lifecycle. Built with modern TypeScript and designed for use in WAI applications, this package offers essential task management functionality with minimal dependencies.

## Comparison with Competitors

| Feature | @wai/task | Todoist API | Asana API | Linear API | Trello API |
|---------|-----------|-------------|-----------|------------|------------|
| **Simple API** | ✅ createTask, updateTaskStatus | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Status Tracking** | ✅ pending, in_progress, completed | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Type Safety** | ✅ Full TypeScript | ⚠️ Partial | ⚠️ Partial | ✅ TypeScript | ⚠️ Partial |
| **Zero Dependencies** | ✅ Only effect/schema | ❌ Heavy deps | ❌ Heavy deps | ❌ Heavy deps | ❌ Heavy deps |
| **Bundle Size** | 🟢 Tiny | 🟡 Medium | 🟡 Medium | 🟡 Medium | 🟡 Medium |
| **Bun Native** | ✅ Optimized for Bun | ⚠️ Node.js focus | ⚠️ Node.js focus | ⚠️ Node.js focus | ⚠️ Node.js focus |
| **Immutability** | ✅ Functions return new objects | ❌ Mutating | ❌ Mutating | ❌ Mutating | ❌ Mutating |
| **Offline-First** | ✅ Works locally | ❌ Requires API | ❌ Requires API | ❌ Requires API | ❌ Requires API |
| **Extensible** | ✅ Easy to add custom fields | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Subtasks Support** | ✅ Built-in subtasks | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Comments Support** | ✅ Built-in comments | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |

### Why @wai/task?

- **Minimal & Type-Safe**: API ที่เรียบง่ายและ type-safe สมบูรณ์
- **Immutable**: Functions ส่งคืน objects ใหม่ ไม่ mutate
- **Bun Native**: ปรับแต่งสำหรับ Bun runtime ทำให้เร็วและมีประสิทธิภาพ
- **Offline-First**: ทำงานได้โดยไม่ต้องเชื่อมต่อกับ API
- **Extensible**: ออกแบบมาให้เพิ่ม custom fields ได้ง่าย

### Current Status

- ✅ **Task Types**: สมบูรณ์
- ✅ **Task Functions**: สมบูรณ์
- ✅ **Subtasks**: สมบูรณ์
- ✅ **Comments**: สมบูรณ์
- ✅ **Filtering & Sorting**: สมบูรณ์

### Recommendations

- **ใช้ @wai/task ถ้า**: ต้องการ task management ที่เล็ก, เร็ว, และ type-safe สำหรับระบบของคุณ
- **ใช้ Todoist API ถ้า**: ต้องการ integration กับ Todoist ecosystem
- **ใช้ Asana API ถ้า**: ต้องการ enterprise task management พร้อม features ครบถ้วน
- **ใช้ Linear API ถ้า**: ต้องการ modern project management พร้อม sleek UI
- **ใช้ Trello API ถ้า**: ต้องการ kanban-style task management

## Features

- 📋 **Simple Task Creation**: Create tasks with unique IDs and timestamps
- 🔄 **Status Tracking**: Track task status through pending, in_progress, and completed states
- 🔒 **Type Safety**: Full TypeScript support with strongly typed interfaces
- ⚡ **Lightweight**: Minimal dependencies for fast integration
- 📝 **Optional Descriptions**: Support for task descriptions
- 🕐 **Timestamps**: Automatic createdAt and updatedAt tracking

## Goals

- 🎯 Provide a simple, intuitive task management system
- 🔄 Enable easy status tracking for tasks
- 🔒 Ensure type safety throughout the API
- ⚡ Keep the library lightweight and fast
- 📝 Support essential task metadata
- 🕐 Provide automatic timestamp tracking
- 🧩 Enable easy integration with WAI applications

## Design Principles

- 🧱 **Simplicity First**: Minimal API surface area for ease of use
- 🔒 **Type Safety**: Strong TypeScript typing throughout
- ⚡ **Performance**: Lightweight with no unnecessary overhead
- 📝 **Immutability**: Functions return new task objects rather than mutating
- 🕐 **Automatic Timestamps**: Created and updated times are managed automatically
- 🎯 **Focused Scope**: Provides only essential task management features

## Installation

```bash
# Install from monorepo
bun install
```

## Usage

### Creating a Task

```typescript
import { createTask } from '@wai/task';

const task = createTask('Implement feature X');
console.log(task);
// {
//   id: 'uuid-here',
//   name: 'Implement feature X',
//   status: 'pending',
//   createdAt: Date,
//   updatedAt: Date
// }
```

### Updating Task Status

```typescript
import { createTask, updateTaskStatus } from '@wai/task';

const task = createTask('Implement feature X');
const updatedTask = updateTaskStatus(task, 'in_progress');

console.log(updatedTask.status); // 'in_progress'
console.log(updatedTask.updatedAt > task.createdAt); // true
```

### Task Status Lifecycle

```typescript
import { createTask, updateTaskStatus } from '@wai/task';

const task = createTask('Implement feature X');

// Start working on task
const inProgress = updateTaskStatus(task, 'in_progress');

// Complete the task
const completed = updateTaskStatus(inProgress, 'completed');

console.log(completed.status); // 'completed'
```

## Examples

### Basic Task Management

```typescript
import { createTask, updateTaskStatus } from '@wai/task';

// Create tasks for a project
const tasks = [
  createTask('Design database schema'),
  createTask('Implement API endpoints'),
  createTask('Write unit tests'),
];

// Update task status as work progresses
const tasksInProgress = tasks.map(task =>
  updateTaskStatus(task, 'in_progress')
);

// Mark tasks as completed
const completedTasks = tasksInProgress.map(task =>
  updateTaskStatus(task, 'completed')
);
```

### Task Filtering

```typescript
import { createTask, updateTaskStatus } from '@wai/task';

const tasks = [
  createTask('Task 1'),
  createTask('Task 2'),
  createTask('Task 3'),
];

// Update some tasks
const updatedTasks = [
  updateTaskStatus(tasks[0], 'in_progress'),
  updateTaskStatus(tasks[1], 'completed'),
  tasks[2],
];

// Filter by status
const pendingTasks = updatedTasks.filter(t => t.status === 'pending');
const inProgressTasks = updatedTasks.filter(t => t.status === 'in_progress');
const completedTasks = updatedTasks.filter(t => t.status === 'completed');
```

## License

This project is licensed under the MIT License.
