const { expect, test } = require("playwright/test");

test("catalog display sections, recommendations, and search filters work", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "신상품 드롭" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "베스트셀러" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "카테고리 셀렉션" })).toBeVisible();

  await page.goto("/products/linen-bed-set", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "린넨 베드 세트" })).toBeVisible();

  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "최근 본 상품", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "최근 본 상품 이어보기" })).toBeVisible();

  await page.goto("/search", { waitUntil: "networkidle" });
  await page.getByPlaceholder("예: 여름 리빙 10만원 이하 베이지 선물").fill("여름 리빙 베이지 10만원 이하");
  await page.getByRole("button", { name: "검색" }).click();
  await expect(page).toHaveURL(/q=/);
  await expect(page.getByText("색상 · beige")).toBeVisible();
  await expect(page.getByText("시즌 · summer")).toBeVisible();
  await expect(page.locator('a[href^="/products/"]').first()).toBeVisible();

  await page.locator("form select").selectOption("kitchen");
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/category=kitchen/);
  await expect(page.locator('a[href^="/products/"]').first()).toBeVisible();

  await page.locator('a[href*="sort=popular"]').first().click();
  await expect(page).toHaveURL(/sort=popular/);
  await expect(page.locator('a[href^="/products/"]').first()).toBeVisible();

  await page.goto("/category/kitchen", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "이번 주 신상품" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "인기 상품" })).toBeVisible();
  await expect(page.locator('a[href^="/products/"]').first()).toBeVisible();
});
