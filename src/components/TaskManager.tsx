"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { trpc } from "@/utils/trpc";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import { useTranslations } from "next-intl";
import type { Task } from "@/server/store";

type InitialPage = { items: Task[]; nextCursor: number | null; total: number };

export function TaskManager({ initialPage }: { initialPage: InitialPage }) {
  const t = useTranslations();
  const utils = trpc.useUtils();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [error, setError] = useState("");
  const sentinel = useRef<HTMLDivElement>(null);

  const { data, error: loadError, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching } = trpc.tasks.infinite.useInfiniteQuery(
    { limit: 10 },
    { initialCursor: 0, getNextPageParam: (lastPage) => lastPage.nextCursor, initialData: { pages: [initialPage], pageParams: [0] } }
  );
  const tasks = data?.pages.flatMap((page) => page.items) ?? initialPage.items;
  const total = data?.pages[0]?.total ?? initialPage.total;
  const completed = tasks.filter((task) => task.completed).length;
  const refresh = () => { void utils.tasks.infinite.invalidate(); };
  const create = trpc.tasks.create.useMutation({ onSuccess: () => { setTitle(""); setDescription(""); setError(""); refresh(); } });
  const update = trpc.tasks.update.useMutation({ onSuccess: () => { setEditing(null); setError(""); refresh(); } });
  const remove = trpc.tasks.delete.useMutation({ onSuccess: () => { setError(""); refresh(); } });
  const pending = create.isPending || update.isPending || remove.isPending;

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage || !sentinel.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) void fetchNextPage();
    }, { rootMargin: "240px" });
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) { setError(t("titleRequired")); return; }
    setError("");
    create.mutate({ title, description }, { onError: (e) => setError(e.message) });
  }
  function startEditing(task: Task) {
    setEditing(task.id); setEditTitle(task.title); setEditDescription(task.description); setError("");
  }

  return <div className="space-y-8">
    <header className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-bold uppercase tracking-[.24em]" style={{ color: "var(--pink)" }}>{t("brand")}</span>
        <div className="flex items-center gap-2"><LanguageToggle /><ThemeToggle /></div>
      </div>
      <div className="rounded-2xl p-6 sm:p-8" style={{ background: "linear-gradient(115deg,#17233e 0%,#263d6b 60%,#61305c 100%)", color: "white" }}>
        <p className="mb-3 text-sm font-medium" style={{ color: "#a9caff" }}>{t("workspace")}</p>
        <h1 className="text-4xl font-bold tracking-tight">Task Manager<span style={{ color: "#ff4b91" }}>.</span></h1>
        <p className="mt-3 text-sm" style={{ color: "#d8e3fa" }}>{t("tagline")}</p>
      </div>
    </header>

    <section className="card" aria-labelledby="create-heading">
      <h2 id="create-heading" className="mb-5 text-xl font-bold">{t("createHeading")}</h2>
      <form onSubmit={onCreate} className="space-y-4">
        <label className="block text-sm font-medium">Title
          <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} required placeholder={t("titlePlaceholder")} />
        </label>
        <label className="block text-sm font-medium">Description (optional)
          <textarea className="field" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} rows={2} placeholder={t("descriptionPlaceholder")} />
        </label>
        <button disabled={pending} className="primary">{create.isPending ? t("creating") : t("add")}</button>
      </form>
    </section>

    {error && <p role="alert" className="error">{error}</p>}
    {loadError && <p role="alert" className="error">{t("loadError", { message: loadError.message })}</p>}

    <section aria-labelledby="tasks-heading">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 id="tasks-heading" className="text-xl font-bold">{t("tasks")}</h2>
          <p className="muted mt-1 text-sm">{t("loaded", { loaded: tasks.length, total, completed })}</p>
        </div>
        {isFetching && !isFetchingNextPage && <span className="muted text-xs">{t("syncing")}</span>}
      </div>
      {tasks.length === 0 ? <p className="card muted text-center">{t("empty")}</p> :
        <ul className="space-y-3">{tasks.map((task) => <li key={task.id} className="card">
          {editing === task.id ? <form className="space-y-3" onSubmit={(event) => {
            event.preventDefault();
            if (!editTitle.trim()) { setError("Please enter a task title."); return; }
            update.mutate({ id: task.id, title: editTitle, description: editDescription }, { onError: (e) => setError(e.message) });
          }}>
            <input aria-label="Edit title" className="field" value={editTitle} maxLength={120} onChange={(e) => setEditTitle(e.target.value)} required />
            <textarea aria-label="Edit description" className="field" value={editDescription} maxLength={500} onChange={(e) => setEditDescription(e.target.value)} />
            <div className="flex gap-2">
              <button disabled={pending} className="primary">{t("save")}</button>
              <button type="button" className="secondary" onClick={() => setEditing(null)}>{t("cancel")}</button>
            </div>
          </form> : <div className="flex flex-wrap items-start gap-3">
            <input type="checkbox" aria-label={t(task.completed ? "markIncomplete" : "markComplete", { title: task.title })} checked={task.completed} disabled={pending} onChange={() => update.mutate({ id: task.id, completed: !task.completed }, { onError: (e) => setError(e.message) })} className="mt-1 h-5 w-5" style={{ accentColor: "var(--pink)" }} />
            <div className="min-w-0 flex-1">
              <p className={`task-title ${task.completed ? "done" : ""}`}>{task.title}</p>
              {task.description && <p className="muted mt-1 whitespace-pre-wrap break-words text-sm">{task.description}</p>}
            </div>
            <button className="secondary text-sm" onClick={() => startEditing(task)} disabled={pending}>{t("edit")}</button>
            <button className="secondary danger text-sm" onClick={() => {
              if (window.confirm(t("confirmDelete"))) remove.mutate({ id: task.id }, { onError: (e) => setError(e.message) });
            }} disabled={pending}>{t("delete")}</button>
          </div>}
        </li>)}</ul>}
      <div ref={sentinel} className="py-5 text-center text-sm" aria-live="polite">
        {isFetchingNextPage ? <span className="muted">{t("loading")}</span> :
          hasNextPage ? <button type="button" className="secondary" onClick={() => void fetchNextPage()}>{t("more")}</button> :
          tasks.length > 0 ? <span className="muted">{t("caught")}</span> : null}
      </div>
    </section>
  </div>;
}
