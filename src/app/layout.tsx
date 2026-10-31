import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Task Manager", description: "Next.js 15 + tRPC technical case" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
