import ProductRouteChromeOff from "@/components/layout/ProductRouteChromeOff";

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ProductRouteChromeOff />
      {children}
    </>
  );
}
