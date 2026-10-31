import { createCaller } from "@/server/routers";
import { TaskManager } from "@/components/TaskManager";
import { TrpcProvider } from "@/components/TrpcProvider";

export const dynamic = "force-dynamic";

export default async function Home() {
  const caller = createCaller({});
  const initialTasks = await caller.tasks.list();

  return <main className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
    <TrpcProvider><TaskManager initialTasks={initialTasks} /></TrpcProvider>
  </main>;
}
