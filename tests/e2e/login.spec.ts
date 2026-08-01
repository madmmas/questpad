import { expect, test } from "@playwright/test";

// Land on `/` after login — it only needs the session cookie, not Postgres
// (CI e2e has no DATABASE_URL; `/dashboard` and `/board` would 500).
const NEXT_PATH = "/login?next=/";

test("renders the sign-in form", async ({ page }) => {
  await page.goto(NEXT_PATH);
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  await expect(page.getByLabel("Username")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
});

test("rejects invalid credentials with an error message", async ({
  page,
}) => {
  await page.goto(NEXT_PATH);
  await page.getByLabel("Username").fill("parent");
  await page.getByLabel("Password").fill("parent1234");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page.getByText("Invalid username or password")).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

test("rejects an unknown username", async ({ page }) => {
  await page.goto(NEXT_PATH);
  await page.getByLabel("Username").fill("not-a-real-user");
  await page.getByLabel("Password").fill("whatever");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page.getByText("Invalid username or password")).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

test("signs in with valid parent credentials and redirects", async ({
  page,
}) => {
  await page.goto(NEXT_PATH);
  await page.getByLabel("Username").fill("parent");
  await page.getByLabel("Password").fill("parent123");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole("heading", { name: "Family learning tracker" }),
  ).toBeVisible();
});

test("signs in with valid child credentials and redirects", async ({
  page,
}) => {
  await page.goto(NEXT_PATH);
  await page.getByLabel("Username").fill("child");
  await page.getByLabel("Password").fill("child123");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole("heading", { name: "Family learning tracker" }),
  ).toBeVisible();
});
