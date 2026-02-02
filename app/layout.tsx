import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToastProvider from "@/components/ui/ToastProvider";
import CartToastProvider from "@/components/cart/CartToastProvider";

export const metadata = {
  title: "Market Place",
  description: "Mini e-commerce (MVP) — Next.js + TS",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900 pt-[76px]">
        <ToastProvider>
          <CartToastProvider>
            <Header />
            <main className="min-h-[70vh] pt-20">{children}</main>
            <Footer />
          </CartToastProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
