import { createCaller } from "@/server/routers";
import { TaskManager } from "@/components/TaskManager";
import { TrpcProvider } from "@/components/TrpcProvider";
import { LocaleProvider } from "@/components/LocaleProvider";

export const dynamic = "force-dynamic";

export default async function Home() {
  const caller = createCaller({});
  const initialPage = await caller.tasks.infinite({ limit: 10 });

  return <main className="app-frame">
    <LocaleProvider><TrpcProvider><TaskManager initialPage={initialPage} /></TrpcProvider></LocaleProvider>
  </main>;
}
