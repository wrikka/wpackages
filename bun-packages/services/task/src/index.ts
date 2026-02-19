import { Schema } from "effect";

export type TaskId = string;

export type TaskStatus = "pending" | "in_progress" | "completed";

export type TaskPriority = "low" | "medium" | "high";

export interface TaskComment {
  readonly id: string;
  readonly message: string;
  readonly createdAt: Date;
}

export interface TaskSubtask {
  readonly id: string;
  readonly name: string;
  readonly completed: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export type TaskEvent =
  | {
      readonly type: "created";
      readonly at: Date;
    }
  | {
      readonly type: "name_updated";
      readonly at: Date;
      readonly previousName: string;
      readonly nextName: string;
    }
  | {
      readonly type: "description_updated";
      readonly at: Date;
      readonly previousDescription?: string;
      readonly nextDescription?: string;
    }
  | {
      readonly type: "status_updated";
      readonly at: Date;
      readonly previousStatus: TaskStatus;
      readonly nextStatus: TaskStatus;
    }
  | {
      readonly type: "priority_updated";
      readonly at: Date;
      readonly previousPriority: TaskPriority;
      readonly nextPriority: TaskPriority;
    }
  | {
      readonly type: "due_date_updated";
      readonly at: Date;
      readonly previousDueDate?: Date;
      readonly nextDueDate?: Date;
    }
  | {
      readonly type: "tags_updated";
      readonly at: Date;
      readonly previousTags: readonly string[];
      readonly nextTags: readonly string[];
    }
  | {
      readonly type: "assignee_updated";
      readonly at: Date;
      readonly previousAssignee?: string;
      readonly nextAssignee?: string;
    }
  | {
      readonly type: "progress_updated";
      readonly at: Date;
      readonly previousProgress: number;
      readonly nextProgress: number;
    }
  | {
      readonly type: "subtask_added";
      readonly at: Date;
      readonly subtaskId: string;
    }
  | {
      readonly type: "subtask_updated";
      readonly at: Date;
      readonly subtaskId: string;
    }
  | {
      readonly type: "comment_added";
      readonly at: Date;
      readonly commentId: string;
    };

export interface Task {
  readonly id: TaskId;
  readonly name: string;
  readonly description?: string;
  readonly status: TaskStatus;
  readonly priority: TaskPriority;
  readonly tags: readonly string[];
  readonly dueDate?: Date;
  readonly assignee?: string;
  readonly progress: number;
  readonly subtasks: readonly TaskSubtask[];
  readonly comments: readonly TaskComment[];
  readonly events: readonly TaskEvent[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface TaskEventDTO {
  readonly type: string;
  readonly at: string;
  readonly [k: string]: unknown;
}

export class InvalidTaskError extends Error {
  readonly name = "InvalidTaskError";

  constructor(message: string) {
    super(message);
  }
}

export class TransitionNotAllowedError extends Error {
  readonly name = "TransitionNotAllowedError";

  constructor(message: string) {
    super(message);
  }
}

export interface TaskFactoryOptions {
  readonly idGenerator?: () => string;
  readonly now?: () => Date;
  readonly nameMaxLength?: number;
}

const defaultIdGenerator = () => crypto.randomUUID();
const defaultNow = () => new Date();

function normalizeName(name: string): string {
  return name.trim();
}

function assertValidName(name: string, maxLength: number): void {
  const normalized = normalizeName(name);
  if (normalized.length === 0) {
    throw new InvalidTaskError("Task name must be non-empty");
  }
  if (normalized.length > maxLength) {
    throw new InvalidTaskError(`Task name must be <= ${maxLength} characters`);
  }
}

function assertValidProgress(progress: number): void {
  if (!Number.isFinite(progress)) {
    throw new InvalidTaskError("Task progress must be a finite number");
  }
  if (progress < 0 || progress > 100) {
    throw new InvalidTaskError("Task progress must be between 0 and 100");
  }
}

const allowedTransitions: Readonly<Record<TaskStatus, ReadonlySet<TaskStatus>>> = {
  pending: new Set(["pending", "in_progress", "completed"]),
  in_progress: new Set(["in_progress", "completed"]),
  completed: new Set(["completed"])
} as const;

function assertTransitionAllowed(previous: TaskStatus, next: TaskStatus): void {
  const allowed = allowedTransitions[previous];
  if (!allowed.has(next)) {
    throw new TransitionNotAllowedError(`Transition not allowed: ${previous} -> ${next}`);
  }
}

export interface CreateTaskInput {
  readonly name: string;
  readonly description?: string;
  readonly status?: TaskStatus;
  readonly priority?: TaskPriority;
  readonly tags?: readonly string[];
  readonly dueDate?: Date;
  readonly assignee?: string;
  readonly progress?: number;
}

export function createTask(input: CreateTaskInput, options: TaskFactoryOptions = {}): Task {
  const idGenerator = options.idGenerator ?? defaultIdGenerator;
  const now = options.now ?? defaultNow;
  const nameMaxLength = options.nameMaxLength ?? 200;

  assertValidName(input.name, nameMaxLength);

  const createdAt = now();
  const updatedAt = createdAt;

  const status: TaskStatus = input.status ?? "pending";
  const priority: TaskPriority = input.priority ?? "medium";
  const tags = [...new Set((input.tags ?? []).map((t) => t.trim()).filter((t) => t.length > 0))];

  const progress = input.progress ?? 0;
  assertValidProgress(progress);

  const task: Task = {
    id: idGenerator(),
    name: normalizeName(input.name),
    description: input.description,
    status,
    priority,
    tags,
    dueDate: input.dueDate,
    assignee: input.assignee,
    progress,
    subtasks: [],
    comments: [],
    events: [{ type: "created", at: createdAt }],
    createdAt,
    updatedAt
  };

  return task;
}

export function isOverdue(task: Task, at: Date = new Date()): boolean {
  if (!task.dueDate) return false;
  if (task.status === "completed") return false;
  return task.dueDate.getTime() < at.getTime();
}

function withUpdate(task: Task, next: Omit<Task, "createdAt">): Task {
  return {
    ...next,
    createdAt: task.createdAt
  };
}

export function updateTaskName(task: Task, name: string, options: TaskFactoryOptions = {}): Task {
  const nameMaxLength = options.nameMaxLength ?? 200;
  assertValidName(name, nameMaxLength);

  const now = options.now ?? defaultNow;
  const at = now();

  return withUpdate(task, {
    ...task,
    name: normalizeName(name),
    updatedAt: at,
    events: [
      ...task.events,
      {
        type: "name_updated",
        at,
        previousName: task.name,
        nextName: normalizeName(name)
      }
    ]
  });
}

export function updateTaskDescription(task: Task, description: string | undefined, options: TaskFactoryOptions = {}): Task {
  const now = options.now ?? defaultNow;
  const at = now();

  return withUpdate(task, {
    ...task,
    description,
    updatedAt: at,
    events: [
      ...task.events,
      {
        type: "description_updated",
        at,
        previousDescription: task.description,
        nextDescription: description
      }
    ]
  });
}

export function updateTaskStatus(task: Task, status: TaskStatus, options: TaskFactoryOptions = {}): Task {
  assertTransitionAllowed(task.status, status);

  const now = options.now ?? defaultNow;
  const at = now();

  return withUpdate(task, {
    ...task,
    status,
    updatedAt: at,
    events: [
      ...task.events,
      {
        type: "status_updated",
        at,
        previousStatus: task.status,
        nextStatus: status
      }
    ]
  });
}

export function setTaskPriority(task: Task, priority: TaskPriority, options: TaskFactoryOptions = {}): Task {
  const now = options.now ?? defaultNow;
  const at = now();

  return withUpdate(task, {
    ...task,
    priority,
    updatedAt: at,
    events: [
      ...task.events,
      {
        type: "priority_updated",
        at,
        previousPriority: task.priority,
        nextPriority: priority
      }
    ]
  });
}

export function setTaskDueDate(task: Task, dueDate: Date | undefined, options: TaskFactoryOptions = {}): Task {
  const now = options.now ?? defaultNow;
  const at = now();

  return withUpdate(task, {
    ...task,
    dueDate,
    updatedAt: at,
    events: [
      ...task.events,
      {
        type: "due_date_updated",
        at,
        previousDueDate: task.dueDate,
        nextDueDate: dueDate
      }
    ]
  });
}

export function setTaskTags(task: Task, tags: readonly string[], options: TaskFactoryOptions = {}): Task {
  const now = options.now ?? defaultNow;
  const at = now();
  const nextTags = [...new Set(tags.map((t) => t.trim()).filter((t) => t.length > 0))];

  return withUpdate(task, {
    ...task,
    tags: nextTags,
    updatedAt: at,
    events: [
      ...task.events,
      {
        type: "tags_updated",
        at,
        previousTags: task.tags,
        nextTags
      }
    ]
  });
}

export function addTaskTag(task: Task, tag: string, options: TaskFactoryOptions = {}): Task {
  return setTaskTags(task, [...task.tags, tag], options);
}

export function removeTaskTag(task: Task, tag: string, options: TaskFactoryOptions = {}): Task {
  return setTaskTags(
    task,
    task.tags.filter((t) => t !== tag),
    options
  );
}

export function setTaskAssignee(task: Task, assignee: string | undefined, options: TaskFactoryOptions = {}): Task {
  const now = options.now ?? defaultNow;
  const at = now();

  return withUpdate(task, {
    ...task,
    assignee,
    updatedAt: at,
    events: [
      ...task.events,
      {
        type: "assignee_updated",
        at,
        previousAssignee: task.assignee,
        nextAssignee: assignee
      }
    ]
  });
}

export function setTaskProgress(task: Task, progress: number, options: TaskFactoryOptions = {}): Task {
  assertValidProgress(progress);

  const now = options.now ?? defaultNow;
  const at = now();

  return withUpdate(task, {
    ...task,
    progress,
    updatedAt: at,
    events: [
      ...task.events,
      {
        type: "progress_updated",
        at,
        previousProgress: task.progress,
        nextProgress: progress
      }
    ]
  });
}

export interface AddSubtaskInput {
  readonly name: string;
}

export function addSubtask(task: Task, input: AddSubtaskInput, options: TaskFactoryOptions = {}): Task {
  const idGenerator = options.idGenerator ?? defaultIdGenerator;
  const now = options.now ?? defaultNow;
  const nameMaxLength = options.nameMaxLength ?? 200;

  assertValidName(input.name, nameMaxLength);

  const at = now();
  const subtaskId = idGenerator();

  const subtask: TaskSubtask = {
    id: subtaskId,
    name: normalizeName(input.name),
    completed: false,
    createdAt: at,
    updatedAt: at
  };

  return withUpdate(task, {
    ...task,
    subtasks: [...task.subtasks, subtask],
    updatedAt: at,
    events: [...task.events, { type: "subtask_added", at, subtaskId }]
  });
}

export function setSubtaskCompleted(task: Task, subtaskId: string, completed: boolean, options: TaskFactoryOptions = {}): Task {
  const now = options.now ?? defaultNow;
  const at = now();

  const index = task.subtasks.findIndex((s) => s.id === subtaskId);
  if (index === -1) {
    throw new InvalidTaskError(`Subtask not found: ${subtaskId}`);
  }

  const nextSubtasks = task.subtasks.map((s) =>
    s.id === subtaskId
      ? {
          ...s,
          completed,
          updatedAt: at
        }
      : s
  );

  return withUpdate(task, {
    ...task,
    subtasks: nextSubtasks,
    updatedAt: at,
    events: [...task.events, { type: "subtask_updated", at, subtaskId }]
  });
}

export function addTaskComment(task: Task, message: string, options: TaskFactoryOptions = {}): Task {
  const idGenerator = options.idGenerator ?? defaultIdGenerator;
  const now = options.now ?? defaultNow;
  const at = now();

  const trimmed = message.trim();
  if (trimmed.length === 0) {
    throw new InvalidTaskError("Comment message must be non-empty");
  }

  const commentId = idGenerator();
  const comment: TaskComment = {
    id: commentId,
    message: trimmed,
    createdAt: at
  };

  return withUpdate(task, {
    ...task,
    comments: [...task.comments, comment],
    updatedAt: at,
    events: [...task.events, { type: "comment_added", at, commentId }]
  });
}

export interface TaskDTO {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly status: TaskStatus;
  readonly priority: TaskPriority;
  readonly tags: readonly string[];
  readonly dueDate?: string;
  readonly assignee?: string;
  readonly progress: number;
  readonly subtasks: readonly {
    readonly id: string;
    readonly name: string;
    readonly completed: boolean;
    readonly createdAt: string;
    readonly updatedAt: string;
  }[];
  readonly comments: readonly {
    readonly id: string;
    readonly message: string;
    readonly createdAt: string;
  }[];
  readonly events: readonly TaskEventDTO[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export const TaskDTOSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  description: Schema.optional(Schema.String),
  status: Schema.Union(Schema.Literal("pending"), Schema.Literal("in_progress"), Schema.Literal("completed")),
  priority: Schema.Union(Schema.Literal("low"), Schema.Literal("medium"), Schema.Literal("high")),
  tags: Schema.Array(Schema.String),
  dueDate: Schema.optional(Schema.String),
  assignee: Schema.optional(Schema.String),
  progress: Schema.Number,
  subtasks: Schema.Array(
    Schema.Struct({
      id: Schema.String,
      name: Schema.String,
      completed: Schema.Boolean,
      createdAt: Schema.String,
      updatedAt: Schema.String
    })
  ),
  comments: Schema.Array(
    Schema.Struct({
      id: Schema.String,
      message: Schema.String,
      createdAt: Schema.String
    })
  ),
  events: Schema.Array(Schema.Record({ key: Schema.String, value: Schema.Unknown })),
  createdAt: Schema.String,
  updatedAt: Schema.String
});

export function decodeTaskDTOSync(input: unknown): TaskDTO {
  return Schema.decodeUnknownSync(TaskDTOSchema)(input) as unknown as TaskDTO;
}

export function decodeTaskFromUnknownSync(input: unknown): Task {
  return taskFromDTO(decodeTaskDTOSync(input));
}

export function taskToDTO(task: Task): TaskDTO {
  return {
    id: task.id,
    name: task.name,
    description: task.description,
    status: task.status,
    priority: task.priority,
    tags: task.tags,
    dueDate: task.dueDate?.toISOString(),
    assignee: task.assignee,
    progress: task.progress,
    subtasks: task.subtasks.map((s) => ({
      id: s.id,
      name: s.name,
      completed: s.completed,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString()
    })),
    comments: task.comments.map((c) => ({
      id: c.id,
      message: c.message,
      createdAt: c.createdAt.toISOString()
    })),
    events: task.events.map((e): TaskEventDTO => ({
      ...(e as unknown as Record<string, unknown>),
      type: e.type,
      at: e.at.toISOString()
    })),
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString()
  };
}

export function taskFromDTO(dto: TaskDTO): Task {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    status: dto.status,
    priority: dto.priority,
    tags: dto.tags,
    dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
    assignee: dto.assignee,
    progress: dto.progress,
    subtasks: dto.subtasks.map((s) => ({
      id: s.id,
      name: s.name,
      completed: s.completed,
      createdAt: new Date(s.createdAt),
      updatedAt: new Date(s.updatedAt)
    })),
    comments: dto.comments.map((c) => ({
      id: c.id,
      message: c.message,
      createdAt: new Date(c.createdAt)
    })),
    events: dto.events.map((e) => ({
      ...(e as unknown as Record<string, unknown>),
      type: e.type as TaskEvent["type"],
      at: new Date(e.at)
    })) as unknown as TaskEvent[],
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt)
  };
}

export function filterTasksByStatus(tasks: readonly Task[], status: TaskStatus): Task[] {
  return tasks.filter((t) => t.status === status);
}

export function filterTasksByTag(tasks: readonly Task[], tag: string): Task[] {
  return tasks.filter((t) => t.tags.includes(tag));
}

export function filterTasksDueBefore(tasks: readonly Task[], date: Date): Task[] {
  const time = date.getTime();
  return tasks.filter((t) => t.dueDate !== undefined && t.dueDate.getTime() < time);
}

export function filterOverdueTasks(tasks: readonly Task[], at: Date = new Date()): Task[] {
  return tasks.filter((t) => isOverdue(t, at));
}

export type SortDirection = "asc" | "desc";

function compareNumber(a: number, b: number, direction: SortDirection): number {
  return direction === "asc" ? a - b : b - a;
}

const priorityRank: Readonly<Record<TaskPriority, number>> = {
  low: 0,
  medium: 1,
  high: 2
} as const;

export function sortTasksByCreatedAt(tasks: readonly Task[], direction: SortDirection = "asc"): Task[] {
  return [...tasks].sort((a, b) => compareNumber(a.createdAt.getTime(), b.createdAt.getTime(), direction));
}

export function sortTasksByUpdatedAt(tasks: readonly Task[], direction: SortDirection = "desc"): Task[] {
  return [...tasks].sort((a, b) => compareNumber(a.updatedAt.getTime(), b.updatedAt.getTime(), direction));
}

export function sortTasksByPriority(tasks: readonly Task[], direction: SortDirection = "desc"): Task[] {
  return [...tasks].sort((a, b) => compareNumber(priorityRank[a.priority], priorityRank[b.priority], direction));
}
