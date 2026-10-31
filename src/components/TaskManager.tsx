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

  return <div className="task-shell">
    <header className="hero space-y-5">
      <div className="flex items-center justify-between gap-4">
        <span className="eyebrow">{t("brand")}</span>
        <div className="flex items-center gap-2"><LanguageToggle /><ThemeToggle /></div>
      </div>
      <div className="hero-panel">
        <div className="hero-copy">
          <p className="hero-kicker">{t("workspace")}</p>
          <h1>Task Manager<span>.</span></h1>
          <p className="hero-tagline">{t("tagline")}</p>
        </div>
        <div className="hero-orbit" aria-hidden="true"><span /><span /><span /></div>
      </div>
    </header>

    <section className="create-card card" aria-labelledby="create-heading">
      <div className="section-heading"><div><p className="section-kicker">01 / FOCUS</p><h2 id="create-heading">{t("createHeading")}</h2></div><span className="plus-mark">+</span></div>
      <form onSubmit={onCreate} className="create-form">
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

    <section className="tasks-section" aria-labelledby="tasks-heading">
      <div className="tasks-heading">
        <div><p className="section-kicker">02 / MOMENTUM</p><h2 id="tasks-heading">{t("tasks")}</h2><p className="muted mt-1 text-sm">{t("loaded", { loaded: tasks.length, total, completed })}</p></div>
        <div className="task-count"><strong>{completed}</strong><span>done</span></div>
        {isFetching && !isFetchingNextPage && <span className="muted text-xs">{t("syncing")}</span>}
      </div>
      {tasks.length === 0 ? <p className="card empty-state muted text-center">{t("empty")}</p> :
        <ul className="task-list">{tasks.map((task) => <li key={task.id} className={`card task-card ${task.completed ? "is-complete" : ""}`}>
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
