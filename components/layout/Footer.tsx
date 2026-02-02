import Container from "./Container";

export default function Footer() {
  return (
    <footer className="mt-14 cp-footer">
      <Container className="py-10 text-sm">
        <p className="text-white/70">
          © {new Date().getFullYear()} NCART — Curated Cyberware.
        </p>
      </Container>
    </footer>
  );
}
