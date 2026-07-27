const { test, expect } = require("@playwright/test");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const PKG_ROOT = path.resolve(__dirname, "../..");
let server;
let origin;

test.beforeAll(async () => {
  server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url || "/", "http://127.0.0.1").pathname);
    const filePath = path.normalize(path.join(PKG_ROOT, pathname));
    if (!filePath.startsWith(`${PKG_ROOT}${path.sep}`)) {
      res.writeHead(403).end("Forbidden");
      return;
    }
    fs.readFile(filePath, (error, data) => {
      if (error) {
        res.writeHead(404).end("Not found");
        return;
      }
      res.writeHead(200, { "content-type": path.extname(filePath) === ".html" ? "text/html; charset=utf-8" : "application/octet-stream" });
      res.end(data);
    });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
});

test.afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test("catalog exposes all thirty unique working Header previews", async ({ page }) => {
  await page.goto(`${origin}/templates/blocks/index.html`);
  const cards = page.locator('a.bb-card[href^="hero-"]');
  await expect(cards).toHaveCount(30);

  const entries = await cards.evaluateAll((nodes) => nodes.map((node) => ({
    href: node.getAttribute("href"),
    title: node.querySelector(".bb-card-title")?.textContent?.trim(),
  })));
  expect(new Set(entries.map(({ href }) => href)).size).toBe(30);

  for (const { href, title } of entries) {
    expect(href).toMatch(/^hero-[a-z0-9-]+\.html$/);
    const response = await page.goto(`${origin}/templates/blocks/${href}`);
    expect(response?.ok(), `${href} should resolve`).toBe(true);
    await expect(page.locator("h1.bb-detail-title")).toHaveText(title);
  }
});
