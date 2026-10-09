import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "YUS Textile — управление сайтом",
  description: "Панель управления YUS Textile",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
