import { expect, test } from "@playwright/test";

async function requireAuthenticatedShell(page: import("@playwright/test").Page) {
  await page.goto("/dashboard");

  // "Open navigation" is md:hidden; desktop "Sign out" is hidden below sm.
  // Accept either so auth works on mobile and desktop viewports.
  const shellControl = page
    .getByRole("button", { name: "Open navigation" })
    .or(page.getByRole("button", { name: "Sign out" }));

  await expect(shellControl.first()).toBeVisible({ timeout: 15_000 });
}

test.describe("browser overlay behaviour", () => {
  test("health route stays reachable for e2e boot checks", async ({ page }) => {
    const response = await page.goto("/health");
    expect(response?.ok()).toBeTruthy();
  });

  test("mobile drawer opens, traps dialog semantics, and closes on Escape", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await requireAuthenticatedShell(page);

    const openMenu = page.getByRole("button", { name: "Open navigation" });
    await expect(openMenu).toBeVisible();
    await openMenu.click();

    const drawer = page.getByRole("dialog");
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole("link", { name: "Dashboard" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(drawer).toHaveCount(0);
  });

  test("projects dialog opens with accessible title and closes on Escape", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await requireAuthenticatedShell(page);
    await page.goto("/projects");

    const newProject = page.getByRole("button", { name: /new project/i });
    await expect(newProject).toBeVisible({ timeout: 15_000 });
    await newProject.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: /new project/i })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
  });
});
