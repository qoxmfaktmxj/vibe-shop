const { expect, test } = require("playwright/test");

async function expectHomeContent(page) {
  await expect(page.getByRole("heading", { level: 1 })).toContainText("오브제");
  await expect(page.getByRole("link", { name: /^(컬렉션 보기|상품 자세히 보기)$/ })).toBeVisible();
  await expect(page.locator(".cinema-hero-stage img")).toHaveJSProperty("complete", true);
  await expect(page.locator(".cinema-hero-stage img")).not.toHaveJSProperty("naturalWidth", 0);
}

test("home keeps category navigation and purchase actions usable after scrolling", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/", { waitUntil: "networkidle" });
  await expectHomeContent(page);
  await page.getByRole("link", { name: "이번 계절의 상품 바로 보기" }).click();
  await expect(page.locator("#home-curated")).toBeInViewport();
  await expect(page.locator(".cinema-hero-caption")).not.toContainText("원부터");
  await page.getByRole("link", { name: "아래 컬렉션 둘러보기" }).click();
  const lastCategory = page.locator(".cinema-collection-scene").last().getByRole("link");
  await lastCategory.scrollIntoViewIfNeeded();
  await lastCategory.focus();
  await expect(lastCategory).toBeFocused();
  await lastCategory.press("Enter");
  await expect(page).toHaveURL(/\/category\//);
  await page.goto("/", { waitUntil: "networkidle" });
  const firstProduct = page.locator(".cinema-edit article").first();
  const add = firstProduct.getByRole("button", { name: /장바구니 담기/ });
  await add.scrollIntoViewIfNeeded();
  await expect(firstProduct.locator(".product-card-actions")).toHaveCSS("opacity", "1");
  await add.click();
  await expect(page.getByRole("link", { name: /장바구니 1개 상품/ })).toBeVisible();
  expect(errors).toEqual([]);
});

test("home adapts to viewport and reduced motion without losing scenes", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  for (const width of [1440, 1280, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await expectHomeContent(page);
    expect(await page.evaluate(() => Math.max(document.body.scrollWidth, document.documentElement.scrollWidth) <= innerWidth + 1)).toBe(true);
    const columns = await page.locator(".cinema-collection-scenes").evaluate(element => getComputedStyle(element).gridTemplateColumns.split(" ").length);
    expect(columns).toBe(width >= 1024 ? 3 : width >= 768 ? 2 : 1);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".cinema-collection-scenes")).toHaveCSS("grid-template-columns", /\S+ \S+ \S+/);
  for (const scene of await page.locator(".cinema-collection-scene").all()) {
    await scene.scrollIntoViewIfNeeded();
    await expect(scene.locator(".cinema-collection-media")).toBeVisible();
    await expect(scene.getByRole("link")).toBeVisible();
  }
  await expect(page.locator(".cinema-hero-image")).toHaveCSS("transform", "none");
});

test("desktop product images, prices and cart buttons align across the row", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByRole("link", { name: "이번 계절의 상품 바로 보기" }).click();
  const cards = page.locator(".cinema-edit .product-card");
  await expect(cards).toHaveCount(4);
  const rows = await cards.evaluateAll(elements => elements.map(card => ({
    imageTop: card.firstElementChild.getBoundingClientRect().top,
    priceBottom: card.querySelector(".product-card-purchase > p").getBoundingClientRect().bottom,
    buttonBottom: card.querySelector(".product-card-actions button").getBoundingClientRect().bottom,
  })));
  for (const key of ["imageTop", "priceBottom", "buttonBottom"]) {
    expect(Math.max(...rows.map(row => row[key])) - Math.min(...rows.map(row => row[key]))).toBeLessThan(1);
  }
});

for (const width of [390, 1440]) {
test(`home remains readable and navigable without JavaScript at ${width}px`, async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 1000 } });
  const page = await context.newPage();
  try {
    await page.goto(baseURL, { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { level: 1 })).toContainText("오브제");
    for (const scene of await page.locator(".cinema-collection-scene").all()) {
      await scene.scrollIntoViewIfNeeded();
      await expect(scene.locator(".cinema-collection-media")).toBeVisible();
      await expect(scene.getByRole("link")).toBeVisible();
    }
    const cta = page.getByRole("link", { name: /^(컬렉션 보기|상품 자세히 보기)$/ });
    await expect(cta).toBeVisible();
    const href = await cta.getAttribute("href");
    await cta.click();
    await expect(page).toHaveURL(new URL(href, baseURL).href);
    await expect(page.locator("main")).toBeVisible();
  } finally {
    await context.close();
  }
});
}
