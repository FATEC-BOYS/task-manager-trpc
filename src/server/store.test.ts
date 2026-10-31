import { beforeEach, describe, expect, it } from "vitest";
import { taskStore } from "./store";

beforeEach(() => {
  for (const task of taskStore.list()) taskStore.remove(task.id);
});

describe("in-memory task store", () => {
  it("creates and lists a task", () => {
    const created = taskStore.create("Review case", "Read requirements");
    expect(created.id).toBeTruthy();
    expect(taskStore.list()).toEqual([created]);
  });
  it("updates title and completion", () => {
    const created = taskStore.create("Draft", "");
    expect(taskStore.update(created.id, { title: "Done", completed: true })).toMatchObject({ title: "Done", completed: true });
  });
  it("deletes an existing task", () => {
    const created = taskStore.create("Remove", "");
    expect(taskStore.remove(created.id)).toBe(true);
    expect(taskStore.list()).toHaveLength(0);
    expect(taskStore.remove(created.id)).toBe(false);
  });
  it("returns null for an unknown task", () => {
    expect(taskStore.update(crypto.randomUUID(), { completed: true })).toBeNull();
  });
});
