import { test } from "@playwright/test";
import path from "node:path";

const viewports = [
  { name: "375", width: 375, height: 812 },
  { name: "768", width: 768, height: 1024 },
  { name: "1440", width: 1440, height: 900 },
] as const;

const pages = [
  { name: "login", path: "/login" },
  { name: "hub", path: "/preview/hub" },
  { name: "today", path: "/preview/today" },
  { name: "money", path: "/preview/money" },
] as const;

test("visual signatures at 375 / 768 / 1440", async ({ page }) => {
  const out = path.join(process.cwd(), "screenshots");
  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    for (const p of pages) {
      await page.goto(p.path, { waitUntil: "networkidle" });
      await page.screenshot({
        path: path.join(out, `${p.name}-${vp.name}.png`),
        fullPage: true,
      });
    }
  }
});
