import Link from "next/link";
import Container from "@/components/layout/Container";

export default function NotFound() {
  return (
    <Container className="py-14">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-gray-600">This page doesn’t exist.</p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-lg bg-black px-4 py-2 text-white"
      >
        Go home
      </Link>
    </Container>
  );
}
