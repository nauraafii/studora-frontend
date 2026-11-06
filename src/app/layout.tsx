import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Studora — AI Study Partner", template: "%s | Studora" },
  description: "Mitra belajar AI untuk mengubah materi kuliah menjadi kemajuan.",
};

const themeBootstrap = `(() => {
  const root = document.documentElement;
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const apply = (choice) => {
    root.dataset.themeChoice = choice;
    root.dataset.theme = choice === "system" ? (media.matches ? "dark" : "light") : choice;
  };
  try {
    const stored = localStorage.getItem("studora-theme");
    const choice = stored === "dark" || stored === "system" || stored === "light" ? stored : "light";
    root.dataset.sidebarCollapsed = localStorage.getItem("studora-sidebar-collapsed") === "true" ? "true" : "false";
    apply(choice);
  } catch {
    root.dataset.sidebarCollapsed = "false";
    apply("light");
  }
  media.addEventListener("change", () => {
    if (root.dataset.themeChoice === "system") apply("system");
  });
})();`;

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeBootstrap }} /></head>
      <body>{children}</body>
    </html>
  );
}
