import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawerProvider from "@/components/cart/CartDrawerProvider";

export const metadata = {
  title: "Market Place",
  description: "Mini e-commerce (MVP) — Next.js + TS",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900">
        <CartDrawerProvider>
          <Header />
          <main className="min-h-[70vh]">{children}</main>
          <Footer />
        </CartDrawerProvider>
      </body>
    </html>
  );
}
