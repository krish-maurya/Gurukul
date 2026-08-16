import "./globals.css";
import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "GURUKUL | AI-first School Operating System",
  description: "Intelligent school administration command center with Document OCR Intelligence and Timetable Optimization Engine.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
