import { test, expect } from "@playwright/test";

const CART_KEY = "mp_cart_v2";

async function jsClickByAria(page: any, ariaLabel: string) {
  for (let i = 0; i < 60; i++) {
    // o mini-cart é toast e pode auto-fechar / re-renderizar
    await page.evaluate(() => {
      window.dispatchEvent(
        new CustomEvent("mp:cart:open", { detail: { source: "e2e" } }),
      );
    });

    const ok = await page.evaluate((label: string) => {
      const el = document.querySelector(`[aria-label="${label}"]`) as HTMLElement | null;
      if (!el) return false;
      el.click();
      return true;
    }, ariaLabel);

    if (ok) return;
    await page.waitForTimeout(50);
  }

  throw new Error(`Unable to click aria-label="${ariaLabel}"`);
}

async function getCart(page: any) {
  const raw = await page.evaluate(
    (k: string) => window.localStorage.getItem(k),
    CART_KEY,
  );
  if (!raw) return { items: [] };
  try {
    return JSON.parse(raw);
  } catch {
    return { items: [] };
  }
}

test("e2e: product -> add -> open cart -> qty -> remove", async ({ page, request }) => {
  // 1) pega um produto real (API retorna { products })
  const res = await request.get("/api/products");
  expect(res.ok()).toBeTruthy();

  const data = (await res.json()) as { products: Array<{ id: string; name: string }> };
  expect(Array.isArray(data.products)).toBeTruthy();
  expect(data.products.length).toBeGreaterThan(0);

  const p = data.products[0]!;

  // 2) abre Home e entra no produto via UI (fallback: navega direto)
  await page.goto("/");

  const productLink = page.getByRole("link", { name: p.name }).first();
  if (await productLink.isVisible().catch(() => false)) {
    await productLink.click();
  } else {
    await page.goto(`/product/${encodeURIComponent(p.id)}`);
  }

  await expect(page.getByRole("heading", { level: 1 })).toContainText(p.name);

  // 3) add to cart (CartButton)
  await page.getByRole("button", { name: /add to cart/i }).click();

  // 4) valida persistência (localStorage mp_cart_v2)
  await expect
    .poll(async () => {
      const cart = await getCart(page);
      return cart?.items?.length ?? 0;
    })
    .toBeGreaterThan(0);

  let cart = await getCart(page);
  expect(cart.items[0].product.id).toBe(p.id);
  expect(cart.items[0].quantity).toBe(1);

  // 5) abre o mini-cart pela event bus (sem depender de botão do header)
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent("mp:cart:toggle"));
  });

  await expect(page.getByLabel("Close cart")).toBeVisible();
  await page.waitForTimeout(250);

  // 6) qty +1 (aria-label já existe)
  await jsClickByAria(page, "Increase quantity");
  await page.waitForTimeout(100);

  await expect
    .poll(async () => {
      const c = await getCart(page);
      return (
        c.items.find((it: any) => String(it.product.id) === String(p.id))?.quantity ?? 0
      );
    })
    .toBe(2);

  // 7) qty -1
  await jsClickByAria(page, "Decrease quantity");
  await page.waitForTimeout(100);

  await expect
    .poll(async () => {
      const c = await getCart(page);
      return (
        c.items.find((it: any) => String(it.product.id) === String(p.id))?.quantity ?? 0
      );
    })
    .toBe(1);

  // 8) remove: tenta botão explícito; fallback: decrement removendo (store remove qty<=0)
  const removeBtn = page.getByRole("button", { name: /remove/i }).first();
  if (await removeBtn.isVisible().catch(() => false)) {
    await removeBtn.click();
  } else {
    await jsClickByAria(page, "Decrease quantity");
    await page.waitForTimeout(100);
  }

  await expect
    .poll(async () => {
      const c = await getCart(page);
      return c.items.length;
    })
    .toBe(0);

  // 9) volta pra listagem usando o link real (/?restore=1)
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent("mp:cart:close"));
  });

  await page.getByRole("link", { name: /back to products/i }).click();
  await expect(page).toHaveURL(/\/\?restore=1/);
  await expect(page.getByText("Featured products")).toBeVisible();
});
