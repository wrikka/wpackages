import { describe, it, expect } from 'vitest';
import { createTask, updateTaskStatus, updateTaskName, updateTaskDescription } from '../src/index';

describe('Task Management', () => {
  it('should create a task', () => {
    const task = createTask('Test task');

    expect(task.id).toBeDefined();
    expect(task.name).toBe('Test task');
    expect(task.status).toBe('pending');
    expect(task.createdAt).toBeInstanceOf(Date);
    expect(task.updatedAt).toBeInstanceOf(Date);
  });

  it('should update task status', () => {
    const task = createTask('Test task');
    const updated = updateTaskStatus(task, 'in_progress');

    expect(updated.status).toBe('in_progress');
    expect(updated.id).toBe(task.id);
    expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(task.updatedAt.getTime());
  });

  it('should update task name', () => {
    const task = createTask('Test task');
    const updated = updateTaskName(task, 'Updated task');

    expect(updated.name).toBe('Updated task');
    expect(updated.id).toBe(task.id);
  });

  it('should update task description', () => {
    const task = createTask('Test task');
    const updated = updateTaskDescription(task, 'New description');

    expect(updated.description).toBe('New description');
    expect(updated.id).toBe(task.id);
  });

  it('should handle full task lifecycle', () => {
    const task = createTask('Test task');
    const inProgress = updateTaskStatus(task, 'in_progress');
    const completed = updateTaskStatus(inProgress, 'completed');

    expect(completed.status).toBe('completed');
    expect(completed.id).toBe(task.id);
  });
});
