import { test, expect } from "@playwright/test";

test("login mock redirige y muestra sidebar", async ({ page }) => {
  await page.goto("/login");

  await page.fill("input[type='email']", "foo@example.com");
  await page.fill("input[type='password']", "abc123");
  await page.click("button:has-text('Ingresar')");

  // Esperar redirect al dashboard
  await page.waitForURL("**/partner/dashboard");
  await expect(page.locator("text=Dashboard")).toBeVisible();

  // Verificar que el botón Toggle exista
  await expect(page.locator("[aria-label='Toggle sidebar']")).toBeVisible();
});