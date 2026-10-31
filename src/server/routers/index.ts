import { router, createCallerFactory } from "../trpc";
import { tasksRouter } from "./tasks";

export const appRouter = router({ tasks: tasksRouter });
export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
