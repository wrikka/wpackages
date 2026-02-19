import { describe, expect, it } from "vitest";

import {
  TaskDTOSchema,
  InvalidTaskError,
  TransitionNotAllowedError,
  addSubtask,
  createTask,
  decodeTaskDTOSync,
  filterTasksByStatus,
  filterOverdueTasks,
  setTaskDueDate,
  sortTasksByPriority,
  setSubtaskCompleted,
  taskFromDTO,
  taskToDTO,
  updateTaskStatus
} from "../src/index";

describe("@wai/task", () => {
  it("validates task name (non-empty)", () => {
    expect(() => createTask({ name: "   " })).toThrow(InvalidTaskError);
  });

  it("validates task name (max length)", () => {
    expect(() => createTask({ name: "a".repeat(6) }, { nameMaxLength: 5 })).toThrow(InvalidTaskError);
  });

  it("supports deterministic id + clock", () => {
    const task = createTask(
      { name: "hello" },
      {
        idGenerator: () => "id-1",
        now: () => new Date("2020-01-01T00:00:00.000Z")
      }
    );

    expect(task.id).toBe("id-1");
    expect(task.createdAt.toISOString()).toBe("2020-01-01T00:00:00.000Z");
    expect(task.updatedAt.toISOString()).toBe("2020-01-01T00:00:00.000Z");
  });

  it("guards status transitions", () => {
    const task = createTask({ name: "hello" });
    const done = updateTaskStatus(updateTaskStatus(task, "in_progress"), "completed");

    expect(() => updateTaskStatus(done, "pending")).toThrow(TransitionNotAllowedError);
  });

  it("supports subtasks + serialization", () => {
    const task = createTask(
      { name: "root" },
      {
        idGenerator: (() => {
          const ids = ["t1", "s1"];
          let i = 0;
          return () => ids[i++] ?? "x";
        })(),
        now: () => new Date("2020-01-01T00:00:00.000Z")
      }
    );

    const withSub = addSubtask(task, { name: "sub" }, { now: () => new Date("2020-01-02T00:00:00.000Z") });
    const subtaskId = withSub.subtasks[0]?.id;
    expect(subtaskId).toBeDefined();
    const completed = setSubtaskCompleted(withSub, subtaskId!, true, { now: () => new Date("2020-01-03T00:00:00.000Z") });

    const dto = taskToDTO(completed);
    const roundtrip = taskFromDTO(dto);

    expect(roundtrip.subtasks[0]?.completed).toBe(true);
    expect(roundtrip.createdAt instanceof Date).toBe(true);
  });

  it("supports runtime schema decode for DTO", () => {
    const task = createTask({ name: "root" });
    const dto = taskToDTO(task);
    const decoded = decodeTaskDTOSync(dto);

    expect(decoded.id).toBe(dto.id);
    expect(decoded.name).toBe("root");
    expect(TaskDTOSchema).toBeDefined();
  });

  it("supports sorting and filtering helpers", () => {
    const base = createTask({ name: "a" }, { idGenerator: () => "1", now: () => new Date("2020-01-01T00:00:00.000Z") });
    const b = updateTaskStatus(base, "in_progress");
    const c = setTaskDueDate(base, new Date("2019-12-31T00:00:00.000Z"));

    const filtered = filterTasksByStatus([base, b], "in_progress");
    expect(filtered.length).toBe(1);
    expect(filtered[0]?.status).toBe("in_progress");

    const overdue = filterOverdueTasks([base, c], new Date("2020-01-01T00:00:00.000Z"));
    expect(overdue.length).toBe(1);
    expect(overdue[0]?.id).toBe(c.id);

    const hi = createTask({ name: "hi", priority: "high" });
    const lo = createTask({ name: "lo", priority: "low" });
    const sorted = sortTasksByPriority([lo, hi]);
    expect(sorted[0]?.priority).toBe("high");
  });
});
