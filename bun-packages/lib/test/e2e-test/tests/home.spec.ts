import { expect, test } from "../src/dsl";

test("home page loads", async ({ page }) => {
  await page.goto("/");
  const text = await page.text();
  expect(text).toContain("Windsurf");
});
