import "server-only";

export type Task = { id: string; title: string; description: string; completed: boolean; createdAt: string };
type Store = { tasks: Task[] };
const globalStore = globalThis as typeof globalThis & { __taskManagerStore?: Store };
const store = globalStore.__taskManagerStore ?? { tasks: [] };
globalStore.__taskManagerStore = store;

export const taskStore = {
  list: () => [...store.tasks].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  create: (title: string, description: string) => {
    const task: Task = { id: crypto.randomUUID(), title, description, completed: false, createdAt: new Date().toISOString() };
    store.tasks.unshift(task);
    return task;
  },
  update: (id: string, changes: Partial<Pick<Task, "title" | "description" | "completed">>) => {
    const task = store.tasks.find((item) => item.id === id);
    if (!task) return null;
    Object.assign(task, changes);
    return task;
  },
  remove: (id: string) => {
    const index = store.tasks.findIndex((item) => item.id === id);
    if (index < 0) return false;
    store.tasks.splice(index, 1);
    return true;
  },
};
