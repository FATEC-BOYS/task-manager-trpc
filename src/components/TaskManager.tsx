"use client";

import { useState, type FormEvent } from "react";
import { trpc } from "@/utils/trpc";
import type { Task } from "@/server/store";

export function TaskManager({ initialTasks }: { initialTasks: Task[] }) {
  const utils = trpc.useUtils();
  const { data: tasks = initialTasks, error: loadError, isFetching } = trpc.tasks.list.useQuery(undefined, { initialData: initialTasks });
  const create = trpc.tasks.create.useMutation({ onSuccess: () => { setTitle(""); setDescription(""); setError(""); void utils.tasks.list.invalidate(); } });
  const update = trpc.tasks.update.useMutation({ onSuccess: () => { setEditing(null); setError(""); void utils.tasks.list.invalidate(); } });
  const remove = trpc.tasks.delete.useMutation({ onSuccess: () => { setError(""); void utils.tasks.list.invalidate(); } });
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [error, setError] = useState("");

  const pending = create.isPending || update.isPending || remove.isPending;
  const completed = tasks.filter((task) => task.completed).length;

  function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) { setError("Please enter a task title."); return; }
    setError("");
    create.mutate({ title, description }, { onError: (e) => setError(e.message) });
  }

  function startEditing(task: Task) {
    setEditing(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description);
    setError("");
  }

  return <div className="space-y-8">
    <header className="space-y-2">
      <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">Next.js 15 · tRPC</p>
      <h1 className="text-4xl font-bold tracking-tight">Task Manager</h1>
      <p className="text-slate-600">Keep your day organized, one task at a time.</p>
    </header>

    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" aria-labelledby="create-heading">
      <h2 id="create-heading" className="mb-4 text-xl font-semibold">Create a task</h2>
      <form onSubmit={onCreate} className="space-y-4">
        <label className="block text-sm font-medium">Title
          <input className="mt-1 w-full rounded-lg border border-slate-300 p-3 focus:border-indigo-500 focus:outline-none" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} required placeholder="What needs to be done?" />
        </label>
        <label className="block text-sm font-medium">Description (optional)
          <textarea className="mt-1 w-full rounded-lg border border-slate-300 p-3 focus:border-indigo-500 focus:outline-none" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} rows={2} placeholder="Add some details" />
        </label>
        <button disabled={pending} className="rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">{create.isPending ? "Creating..." : "Add task"}</button>
      </form>
    </section>

    {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}
    {loadError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-700">Unable to refresh tasks: {loadError.message}</p>}

    <section aria-labelledby="tasks-heading">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 id="tasks-heading" className="text-xl font-semibold">Your tasks <span className="text-sm font-normal text-slate-500">({completed}/{tasks.length} completed)</span></h2>
        {isFetching && <span className="text-xs text-slate-500">Syncing…</span>}
      </div>
      {tasks.length === 0 ? <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">No tasks yet. Create your first one above.</p> :
        <ul className="space-y-3">{tasks.map((task) => <li key={task.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          {editing === task.id ? <form className="space-y-3" onSubmit={(event) => {
            event.preventDefault();
            if (!editTitle.trim()) { setError("Please enter a task title."); return; }
            update.mutate({ id: task.id, title: editTitle, description: editDescription }, { onError: (e) => setError(e.message) });
          }}>
            <input aria-label="Edit title" className="w-full rounded-lg border border-slate-300 p-2" value={editTitle} maxLength={120} onChange={(e) => setEditTitle(e.target.value)} required />
            <textarea aria-label="Edit description" className="w-full rounded-lg border border-slate-300 p-2" value={editDescription} maxLength={500} onChange={(e) => setEditDescription(e.target.value)} />
            <div className="flex gap-2">
              <button disabled={pending} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white disabled:opacity-50">Save</button>
              <button type="button" className="rounded-lg border px-3 py-2 text-sm" onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </form> : <div className="flex flex-wrap items-start gap-3">
            <input type="checkbox" aria-label={`Mark ${task.title} as ${task.completed ? "incomplete" : "complete"}`} checked={task.completed} disabled={pending} onChange={() => update.mutate({ id: task.id, completed: !task.completed }, { onError: (e) => setError(e.message) })} className="mt-1 h-5 w-5 accent-indigo-600" />
            <div className="min-w-0 flex-1">
              <p className={`font-semibold break-words ${task.completed ? "text-slate-400 line-through" : ""}`}>{task.title}</p>
              {task.description && <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-500">{task.description}</p>}
            </div>
            <button className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50" onClick={() => startEditing(task)} disabled={pending}>Edit</button>
            <button className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50" onClick={() => {
              if (window.confirm("Delete this task?")) remove.mutate({ id: task.id }, { onError: (e) => setError(e.message) });
            }} disabled={pending}>Delete</button>
          </div>}
        </li>)}</ul>}
    </section>
  </div>;
}
