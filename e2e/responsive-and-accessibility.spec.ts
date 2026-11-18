import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const routes = [
  { path: "/", title: "Ruang Belajar" },
  { path: "/pustaka-materi", title: "Pustaka Materi" },
  { path: "/workspace-ai", title: "Ruang Kerja AI" },
  { path: "/perencana-belajar", title: "Perencana Belajar" },
  { path: "/riwayat", title: "Riwayat Belajar" },
  { path: "/notifikasi", title: "Notifikasi" },
  { path: "/tugas-tenggat", title: "Tugas & Tenggat" },
  { path: "/agent-ai", title: "Agen AI" },
  { path: "/pengaturan", title: "Pengaturan" },
  { path: "/kuis-latihan", title: "Kuis & Latihan" },
  { path: "/catatan-ringkasan", title: "Catatan & Ringkasan" },
  { path: "/bantuan", title: "Bantuan & Dukungan" },
  { path: "/login", title: "Akses akun" },
] as const;

const themes = ["light", "dark"] as const;
const viewports = [
  { width: 320, height: 760 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
] as const;
const landscapeRoutes = new Set(["/", "/workspace-ai", "/pustaka-materi", "/tugas-tenggat", "/perencana-belajar"]);
const landscapeViewports = [
  { width: 568, height: 320 },
  { width: 844, height: 390 },
  { width: 1024, height: 600 },
] as const;

for (const theme of themes) {
  for (const route of routes) {
    test(`${route.path} reflows at mobile, tablet, desktop, and ${theme} theme`, async ({ page }) => {
      await page.addInitScript((choice) => localStorage.setItem("studora-theme", choice), theme);
      await page.setViewportSize(viewports[0]);
      await page.goto(route.path, { waitUntil: "domcontentloaded" });
      await expect(page.locator("main h1").first()).toBeVisible({ timeout: 15_000 });
      await expect(page).toHaveTitle(`${route.title} | Studora`);

      const sizes = [...viewports, ...(landscapeRoutes.has(route.path) ? landscapeViewports : [])];
      for (const viewport of sizes) {
        await page.setViewportSize(viewport);
        await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
        const widths = await page.evaluate(() => ({
          viewport: window.innerWidth,
          document: document.documentElement.scrollWidth,
          body: document.body.scrollWidth,
        }));
        expect(widths.document, `${route.path} document overflow at ${viewport.width}x${viewport.height}`).toBeLessThanOrEqual(widths.viewport);
        expect(widths.body, `${route.path} body overflow at ${viewport.width}x${viewport.height}`).toBeLessThanOrEqual(widths.viewport);
      }

      if (route.path === "/") {
        await page.setViewportSize({ width: 320, height: 760 });
        const clippedLabels = await page.locator(".dashboard-overview-copy > span").evaluateAll((labels) =>
          labels.filter((label) => label.scrollWidth > label.clientWidth + 1).map((label) => label.textContent?.trim()),
        );
        expect(clippedLabels, "dashboard KPI labels must remain readable at 320 CSS px").toEqual([]);
      }

      await page.setViewportSize({ width: 1440, height: 900 });
      const accessibility = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(
        accessibility.violations.map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(" ")).join(", ")}`),
        `axe violations on ${route.path} in ${theme} theme`,
      ).toEqual([]);
    });
  }
}
