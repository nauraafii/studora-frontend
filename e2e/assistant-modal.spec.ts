import { expect, test } from "@playwright/test";

test("assistant dialog traps focus, restores it on close, and locks background scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Buka Asisten AI" });
  await trigger.click();

  const dialog = page.getByRole("dialog", { name: "Asisten belajar" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute("aria-modal", "true");
  for (let index = 0; index < 14; index += 1) {
    await page.keyboard.press("Tab");
    const focusIsInside = await page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]')));
    expect(focusIsInside, `focus escaped the assistant dialog on Tab ${index + 1}`).toBe(true);
  }

  await page.evaluate(() => window.scrollTo(0, 320));
  const scrollBefore = await page.evaluate(() => window.scrollY);
  await page.mouse.move(20, 400);
  await page.mouse.wheel(0, 500);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(scrollBefore);

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("assistant dialog remains within a short mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 360 });
  await page.goto("/");
  await page.getByRole("button", { name: "Buka Asisten AI" }).click();
  const dialog = page.getByRole("dialog", { name: "Asisten belajar" });
  await expect(dialog).toBeVisible();
  const bounds = await dialog.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.y).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(360);
  await page.getByRole("button", { name: "Tutup" }).click();
  await expect(dialog).toBeHidden();
});
