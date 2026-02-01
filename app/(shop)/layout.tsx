import Container from "@/components/layout/Container";

export default function ShopLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <Container className="py-8">{children}</Container>;
}
