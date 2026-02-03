/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// --- next/navigation mock (controla querystring por teste)
let currentQs = "";

jest.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(currentQs),
}));

// --- ProductGrid mock (captura props e renderiza lista simples)
const ProductGridMock = jest.fn(({ products }: { products: any[] }) => {
  return (
    <div data-testid="grid">
      {products.map((p) => (
        <div key={p.id} data-testid="grid-item">
          {p.name}
        </div>
      ))}
    </div>
  );
});

function lastGridProps(): any {
  const calls = ProductGridMock.mock.calls;
  const last = calls[calls.length - 1]?.[0];
  expect(last).toBeTruthy(); // garante que existe e elimina "possibly undefined"
  return last;
}

function expectResultsCount(n: number) {
  const expected = `${n} results`;

  const els = screen.getAllByText((_, node) => {
    if (!node) return false;

    const txt = (node.textContent ?? "").replace(/\s+/g, " ").trim();
    if (txt !== expected) return false;

    // evita match duplicado (pai e filho com o mesmo textContent)
    const childMatches = Array.from(node.children ?? []).some((c) => {
      const cTxt = (c.textContent ?? "").replace(/\s+/g, " ").trim();
      return cTxt === expected;
    });

    return !childMatches;
  });

  expect(els.length).toBeGreaterThan(0);
}

jest.mock("@/components/products/ProductGrid", () => ({
  __esModule: true,
  default: (props: any) => ProductGridMock(props),
}));

import ProductFiltersClient from "@/components/search/ProductFiltersClient";

function makeProducts() {
  // 12 produtos (PAGE_SIZE=9). 10 são "Cyberware" pra testar reset de paginação.
  return [
    {
      id: "p1",
      name: "Neuro-Link",
      priceCents: 5000,
      description: "Neural interface",
      image: "x",
      category: "Cyberware",
      stock: 10,
    },
    {
      id: "p2",
      name: "Optic Scope",
      priceCents: 9000,
      description: "Enhanced vision",
      image: "x",
      category: "Optics",
      stock: 5,
    },
    {
      id: "p3",
      name: "Nano Weave",
      priceCents: 12000,
      description: "Armor layer",
      image: "x",
      category: "Cyberware",
      stock: 0, // out of stock
    },
    {
      id: "p4",
      name: "Reflex Booster",
      priceCents: 15000,
      description: "Speed up",
      image: "x",
      category: "Cyberware",
      stock: 3,
    },
    {
      id: "p5",
      name: "Kiroshi Mk.1",
      priceCents: 8000,
      description: "Optics module",
      image: "x",
      category: "Cyberware",
      stock: 7,
    },
    {
      id: "p6",
      name: "Datajack Pro",
      priceCents: 3000,
      description: "Ports and plugs",
      image: "x",
      category: "Cyberware",
      stock: 2,
    },
    {
      id: "p7",
      name: "Synaptic Accelerant",
      priceCents: 11000,
      description: "Neuro boost",
      image: "x",
      category: "Cyberware",
      stock: 1,
    },
    {
      id: "p8",
      name: "Chromed Lungs",
      priceCents: 7000,
      description: "Breath better",
      image: "x",
      category: "Cyberware",
      stock: 4,
    },
    {
      id: "p9",
      name: "Grip Enhancer",
      priceCents: 2500,
      description: "Hands upgrade",
      image: "x",
      category: "Cyberware",
      stock: 6,
    },
    {
      id: "p10",
      name: "Spine Reinforcement",
      priceCents: 13000,
      description: "Backbone",
      image: "x",
      category: "Cyberware",
      stock: 2,
    },
    {
      id: "p11",
      name: "Wrist Launcher",
      priceCents: 14000,
      description: "Arm weapon",
      image: "x",
      category: "Cyberware",
      stock: 8,
    },
    {
      id: "p12",
      name: "Night Vision Patch",
      priceCents: 6000,
      description: "Optics add-on",
      image: "x",
      category: "Optics",
      stock: 9,
    },
  ];
}

describe("ProductFiltersClient", () => {
  beforeEach(() => {
    currentQs = "";
    jest.clearAllMocks();
    ProductGridMock.mockClear();
  });

  test("default: mostra total e pagina 9 itens + Load more", () => {
    const products = makeProducts();
    render(<ProductFiltersClient products={products as any} />);

    expectResultsCount(12);

    // grid recebeu 9 (PAGE_SIZE)
    const firstCall = ProductGridMock.mock.calls[0][0];
    expect(firstCall.products).toHaveLength(9);

    // botão Load more aparece
    expect(screen.getByRole("button", { name: /load more/i })).toBeInTheDocument();
  });

  test("Load more: aumenta visibleCount e depois some quando não tem mais", async () => {
    const products = makeProducts();
    render(<ProductFiltersClient products={products as any} />);

    fireEvent.click(screen.getByRole("button", { name: /load more/i }));

    // após click, deve renderizar todos 12 (9 + 9 => 18, mas slice limita)
    await waitFor(() => {
      expect(lastGridProps().products).toHaveLength(12);
    });

    // botão some quando não tem mais
    expect(screen.queryByRole("button", { name: /load more/i })).toBeNull();
  });

  test("q filter: filtra por nome/descrição/categoria (case-insensitive)", () => {
    const products = makeProducts();
    currentQs = "q=neuro";
    render(<ProductFiltersClient products={products as any} />);

    expectResultsCount(2); // Neuro-Link + Synaptic Accelerant
    const last = lastGridProps().products as any[];
    expect(last.map((p) => p.name)).toEqual(
      expect.arrayContaining(["Neuro-Link", "Synaptic Accelerant"]),
    );
  });

  test("category filter: usa includes (ex: 'cyber' encontra 'Cyberware')", () => {
    const products = makeProducts();
    currentQs = "category=cyber";
    render(<ProductFiltersClient products={products as any} />);

    // 10 cyberware no seed
    expectResultsCount(10);
  });

  test("inStock filter: remove itens com stock <= 0", () => {
    const products = makeProducts();
    currentQs = "inStock=1";
    render(<ProductFiltersClient products={products as any} />);

    // só p3 tem stock 0, então 11 ficam
    expectResultsCount(11);

    const last = lastGridProps().products as any[];
    expect(last.find((p) => p.id === "p3")).toBeUndefined();
  });

  test("sort: price_desc ordena por maior preço primeiro", () => {
    const products = makeProducts();
    currentQs = "sort=price_desc";
    render(<ProductFiltersClient products={products as any} />);

    const last = lastGridProps().products as any[];
    expect(last[0].priceCents).toBe(15000); // Reflex Booster é o maior
  });

  test("quando filtro muda: reseta paginação pra PAGE_SIZE", async () => {
    const products = makeProducts();

    // começa sem filtro, clica Load more => mostra 12
    currentQs = "";
    const { rerender } = render(<ProductFiltersClient products={products as any} />);

    fireEvent.click(screen.getByRole("button", { name: /load more/i }));

    await waitFor(() => {
      expect(lastGridProps().products).toHaveLength(12);
    });

    // muda filtro pra category=cyber (10 itens) -> deve voltar pra 9 visíveis
    currentQs = "category=cyber";
    rerender(<ProductFiltersClient products={products as any} />);

    await waitFor(() => {
      expect(lastGridProps().products).toHaveLength(9);
      expectResultsCount(10);
      expect(screen.getByRole("button", { name: /load more/i })).toBeInTheDocument();
    });
  });

  test("quando não encontra nada: mostra empty state", () => {
    const products = makeProducts();
    currentQs = "q=___nada___";
    render(<ProductFiltersClient products={products as any} />);

    expectResultsCount(0);
    expect(screen.getByText(/no products found/i)).toBeInTheDocument();
  });
});
