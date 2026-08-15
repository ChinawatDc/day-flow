import { expect, test } from "@playwright/test";

test("login then create task and expense", async ({ page }) => {
  if (!process.env.DATABASE_URL) {
    test.skip();
  }
  const stamp = Date.now();
  const email = `e2e-${stamp}@example.com`;
  await page.goto("/login");
  await page.getByRole("button", { name: "ยังไม่มีบัญชี — สมัคร" }).click();
  await page.locator("#name").fill("ทดสอบ");
  await page.locator("#email").fill(email);
  await page.locator("#password").fill("password12");
  await page.getByRole("button", { name: "สมัคร" }).click();
  await page.waitForURL("**/menu", { timeout: 30000 });

  await page.goto("/tasks");
  await page.locator("#title").fill(`งาน ${stamp}`);
  await page.getByRole("button", { name: "เพิ่มงาน" }).click();
  await expect(page.getByText(`งาน ${stamp}`)).toBeVisible();

  await page.goto("/money");
  await page.locator("#amount").fill("50");
  await page.getByRole("button", { name: "บันทึกรายจ่าย" }).click();
  await expect(page.getByText("฿50").first()).toBeVisible();
});
