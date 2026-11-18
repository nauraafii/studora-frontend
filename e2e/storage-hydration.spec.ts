import { expect, test } from "@playwright/test";

const storedTask = {
  id: "hydration-sentinel",
  title: "Tugas dari penyimpanan lokal",
  course: "Kelas demo",
  dueDate: null,
  status: "open",
  priority: "medium",
  origin: "local",
};

test("shows a loading state until persisted tasks hydrate, then shows the saved task", async ({ page }) => {
  await page.addInitScript((task) => {
    localStorage.setItem("studora-app-state", JSON.stringify({ state: { tasks: [task] }, version: 6 }));
  }, storedTask);
  await page.route("**/_next/static/**/*.js", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 700));
    await route.continue();
  });
  await page.goto("/tugas-tenggat", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("app-loading-state")).toBeVisible();
  await expect(page.getByTestId("app-loading-state")).toHaveAttribute("aria-busy", "true");
  await expect(page.getByText(storedTask.title, { exact: true })).toBeVisible();
  await expect(page.getByTestId("app-loading-state")).toBeHidden();
});

test("does not show a false empty state when browser storage cannot be read", async ({ page }) => {
  await page.addInitScript(() => {
    const originalGetItem = Storage.prototype.getItem;
    Storage.prototype.getItem = function (key: string) {
      if (key === "studora-app-state") throw new Error("Storage unavailable in test");
      return originalGetItem.call(this, key);
    };
  });
  await page.goto("/tugas-tenggat");
  await expect(page.getByTestId("storage-error-state")).toBeVisible();
  await expect(page.getByText("Belum ada tugas", { exact: false })).toHaveCount(0);
});
