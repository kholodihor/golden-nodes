import { Client } from "./client";
import { requireAuth } from "@/utils/auth";

export default async function Home() {
  await requireAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <Client />
    </div>
  );
}
