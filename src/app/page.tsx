import { createCaller } from "@/server/routers";
import { TaskManager } from "@/components/TaskManager";
import { TrpcProvider } from "@/components/TrpcProvider";
import { LocaleProvider } from "@/components/LocaleProvider";

export const dynamic = "force-dynamic";

export default async function Home() {
  const caller = createCaller({});
  const initialPage = await caller.tasks.infinite({ limit: 10 });

  return <main className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
    <LocaleProvider><TrpcProvider><TaskManager initialPage={initialPage} /></TrpcProvider></LocaleProvider>
  </main>;
}
