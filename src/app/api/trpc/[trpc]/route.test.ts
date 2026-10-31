import { beforeEach, describe, expect, it } from "vitest";
import { POST } from "./route";
import { taskStore } from "@/server/store";

beforeEach(() => { for (const task of taskStore.list()) taskStore.remove(task.id); });

describe("HTTP tRPC adapter", () => {
  it("creates and lists tasks through HTTP", async () => {
    const create = await POST(new Request("http://localhost/api/trpc/tasks.create", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ json: { title: "HTTP test", description: "" } })
    }));
    expect(create.status).toBe(200);
    expect(taskStore.list()).toHaveLength(1);
  });
  it("rejects invalid HTTP input", async () => {
    const response = await POST(new Request("http://localhost/api/trpc/tasks.create", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ json: { title: "", description: "" } })
    }));
    expect(response.status).toBe(400);
  });
});
