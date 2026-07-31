import { expect, test } from "@playwright/test";

async function login(
  page: import("@playwright/test").Page,
  role: "parent" | "child",
) {
  await page.goto("/login");
  await page.locator("select").selectOption(role);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test("unauthenticated visitors are sent to login", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
});

test("parent login shows parent navigation", async ({ page }) => {
  await login(page, "parent");
  await expect(page.getByRole("link", { name: "Submit Review" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Add Quest" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Start Quest" })).toHaveCount(0);
});

test("child login shows child navigation", async ({ page }) => {
  await login(page, "child");
  await expect(page.getByRole("link", { name: "Start Quest" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Review" }).first(),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Add Quest" })).toHaveCount(0);
});
