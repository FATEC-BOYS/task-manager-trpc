import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { taskStore } from "../store";

const title = z.string().trim().min(1, "Title is required").max(120, "Maximum 120 characters");
const description = z.string().trim().max(500, "Maximum 500 characters");
const id = z.string().uuid();

export const tasksRouter = router({
  list: publicProcedure.query(() => taskStore.list()),
  create: publicProcedure.input(z.object({ title, description: description.default("") })).mutation(({ input }) =>
    taskStore.create(input.title, input.description)
  ),
  update: publicProcedure.input(z.object({
    id, title: title.optional(), description: description.optional(), completed: z.boolean().optional(),
  }).refine(({ title, description, completed }) => title !== undefined || description !== undefined || completed !== undefined, {
    message: "Provide at least one field to update",
  })).mutation(({ input }) => {
    const { id, ...changes } = input;
    const task = taskStore.update(id, changes);
    if (!task) throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
    return task;
  }),
  delete: publicProcedure.input(z.object({ id })).mutation(({ input }) => {
    if (!taskStore.remove(input.id)) throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
    return { success: true };
  }),
});
