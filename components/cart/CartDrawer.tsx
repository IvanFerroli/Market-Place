"use client";

import Drawer from "@/components/ui/Drawer";
import CartItemRow from "./CartItemRow";
import CartSummary from "./CartSummary";
import { useCartUI } from "./CartDrawerProvider";
import { useCartSnapshot, useCartActions } from "@/lib/cart/store";

export default function CartDrawer() {
  const ui = useCartUI();
  const cart = useCartSnapshot();
  const { clear } = useCartActions();

  return (
    <Drawer open={ui.isOpen} onClose={ui.close} title="Your cart">
      {cart.items.length === 0 ? (
        <div className="py-10 text-sm text-gray-600">Cart is empty.</div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3">
            {cart.items.map((it) => (
              <CartItemRow key={it.product.id} item={it} />
            ))}
          </div>

          <CartSummary cart={cart} />

          <div className="flex gap-2 pt-2">
            <button
              className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
              onClick={clear}
            >
              Clear
            </button>

            <button
              className="ml-auto rounded-lg bg-black px-3 py-2 text-sm text-white hover:opacity-90"
              onClick={() => {
                // placeholder checkout action
                clear();
                ui.close();
              }}
            >
              Checkout (mock)
            </button>
          </div>
        </div>
      )}
    </Drawer>
  );
}
