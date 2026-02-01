import Link from "next/link";
import Container from "./Container";
import CartButton from "@/components/cart/CartButton";
import CartBadge from "@/components/cart/CartBadge";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight">
          Market Place
        </Link>

        <nav className="flex items-center gap-3">
          <Link href="/" className="text-sm text-gray-700 hover:text-black">
            Home
          </Link>

          <div className="relative">
            <CartButton />
            <CartBadge />
          </div>
        </nav>
      </Container>
    </header>
  );
}
