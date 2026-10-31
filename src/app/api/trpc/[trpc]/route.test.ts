import { beforeEach, describe, expect, it } from "vitest";
import { POST } from "./route";
import { taskStore } from "@/server/store";

beforeEach(() => { for (const task of taskStore.list()) taskStore.remove(task.id); });

async function callCreate(title: string) {
  // tRPC v11 uses the JSON body directly for non-batched mutations.
  return POST(new Request("http://localhost/api/trpc/tasks.create", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title, description: "" }),
  }));
}

describe("HTTP tRPC adapter", () => {
  it("creates a task through the HTTP adapter", async () => {
    const response = await callCreate("HTTP test");
    expect(response.status).toBe(200);
    expect(taskStore.list()).toHaveLength(1);
    expect(taskStore.list()[0].title).toBe("HTTP test");
  });
  it("rejects invalid HTTP input", async () => {
    const response = await callCreate("");
    expect(response.status).toBe(400);
    expect(taskStore.list()).toHaveLength(0);
  });
});
