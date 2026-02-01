import Container from "./Container";

export default function Footer() {
  return (
    <footer className="mt-14 border-t bg-white">
      <Container className="py-10 text-sm text-gray-600">
        <p>© {new Date().getFullYear()} Market Place — MVP skeleton.</p>
      </Container>
    </footer>
  );
}
