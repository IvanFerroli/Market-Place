/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";

import FilterBar from "@/components/search/FilterBar";

const replaceMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
  usePathname: () => window.location.pathname,
  useSearchParams: () => new URLSearchParams(window.location.search),
}));

jest.mock("@/components/ui/Button", () => {
  return function MockButton(props: any) {
    return (
      <button type="button" onClick={props.onClick} className={props.className}>
        {props.children}
      </button>
    );
  };
});

jest.mock("@/components/layout/Container", () => {
  return function MockContainer(props: any) {
    return <div data-testid="container">{props.children}</div>;
  };
});

function getParamsFromReplaceCall(callArg: string) {
  const idx = callArg.indexOf("?");
  const qs = idx >= 0 ? callArg.slice(idx + 1) : "";
  return new URLSearchParams(qs);
}

describe("FilterBar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    replaceMock.mockReset();

    // reset URL
    window.history.pushState({}, "", "/");

    // stable rAF for animation effects
    (window as any).requestAnimationFrame = (cb: FrameRequestCallback) => {
      // não executa durante os testes (evita setState fora de act)
      return 1;
    };
    (window as any).cancelAnimationFrame = () => {};
  });

  test("não renderiza quando ?filters=1 não está ativo", () => {
    render(<FilterBar categories={["A"]} />);
    expect(screen.queryByText("Reset filters")).toBeNull();
  });

  test("renderiza quando filters=1 e monta categories únicas/trim/sort", () => {
    window.history.pushState({}, "", "/?filters=1");

    render(<FilterBar categories={["  Beta  ", "Alpha", "Beta", ""]} />);

    expect(screen.getByText("Reset filters")).toBeInTheDocument();

    const selects = screen.getAllByRole("combobox");
    const categorySelect = selects[0];

    const options = Array.from(categorySelect.querySelectorAll("option")).map(
      (o) => o.textContent,
    );

    // All + Alpha + Beta (ordenado)
    expect(options).toEqual(["All", "Alpha", "Beta"]);
  });

  test("category select: seta/remove category e preserva outros params", () => {
    window.history.pushState({}, "", "/?filters=1&q=neo&x=1");
    render(<FilterBar categories={["Implants"]} />);

    const [categorySelect] = screen.getAllByRole("combobox");

    fireEvent.change(categorySelect, { target: { value: "Implants" } });

    expect(replaceMock).toHaveBeenCalledTimes(1);
    const [url, opts] = replaceMock.mock.calls[0];

    expect(opts).toEqual({ scroll: false });
    const params = getParamsFromReplaceCall(url);

    expect(params.get("filters")).toBe("1");
    expect(params.get("q")).toBe("neo");
    expect(params.get("x")).toBe("1");
    expect(params.get("category")).toBe("Implants");

    // voltar pra "All" (value="")
    replaceMock.mockReset();

    fireEvent.change(categorySelect, { target: { value: "" } });

    const [url2] = replaceMock.mock.calls[0];
    const params2 = getParamsFromReplaceCall(url2);

    expect(params2.get("filters")).toBe("1");
    expect(params2.get("q")).toBe("neo");
    expect(params2.get("x")).toBe("1");
    expect(params2.get("category")).toBeNull();
  });

  test("sort select: seta/remove sort", () => {
    window.history.pushState({}, "", "/?filters=1");
    render(<FilterBar categories={[]} />);

    const selects = screen.getAllByRole("combobox");
    const sortSelect = selects[1];

    fireEvent.change(sortSelect, { target: { value: "price_desc" } });

    const [url] = replaceMock.mock.calls[0];
    const params = getParamsFromReplaceCall(url);
    expect(params.get("sort")).toBe("price_desc");

    replaceMock.mockReset();

    fireEvent.change(sortSelect, { target: { value: "" } });

    const [url2] = replaceMock.mock.calls[0];
    const params2 = getParamsFromReplaceCall(url2);
    expect(params2.get("sort")).toBeNull();
  });

  test("inStock: quando inicia true, click remove param", () => {
    window.history.pushState({}, "", "/?filters=1&inStock=yes");
    render(<FilterBar categories={[]} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);

    const [url] = replaceMock.mock.calls[0];
    const params = getParamsFromReplaceCall(url);
    expect(params.get("inStock")).toBeNull();
  });

  test("inStock: quando inicia false, click seta inStock=1", () => {
    window.history.pushState({}, "", "/?filters=1");
    render(<FilterBar categories={[]} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);

    const [url] = replaceMock.mock.calls[0];
    const params = getParamsFromReplaceCall(url);
    expect(params.get("inStock")).toBe("1");
  });

  test("Reset filters: limpa category/sort/inStock e mantém q + filters", () => {
    window.history.pushState(
      {},
      "",
      "/?filters=1&q=neo&category=A&sort=name_asc&inStock=1",
    );

    render(<FilterBar categories={["A"]} />);

    fireEvent.click(screen.getByText("Reset filters"));

    const [url] = replaceMock.mock.calls[0];
    const params = getParamsFromReplaceCall(url);

    expect(params.get("filters")).toBe("1");
    expect(params.get("q")).toBe("neo");
    expect(params.get("category")).toBeNull();
    expect(params.get("sort")).toBeNull();
    expect(params.get("inStock")).toBeNull();
  });

  test("Close: remove filters e mantém o resto", () => {
    window.history.pushState(
      {},
      "",
      "/?filters=1&q=neo&category=A&sort=name_asc&inStock=1",
    );

    render(<FilterBar categories={["A"]} />);

    fireEvent.click(screen.getByText("Close"));

    const [url] = replaceMock.mock.calls[0];
    const params = getParamsFromReplaceCall(url);

    expect(params.get("filters")).toBeNull();
    expect(params.get("q")).toBe("neo");
    expect(params.get("category")).toBe("A");
    expect(params.get("sort")).toBe("name_asc");
    expect(params.get("inStock")).toBe("1");
  });

  test("sync back/forward: URL muda e selects acompanham (rerender)", async () => {
    window.history.pushState({}, "", "/?filters=1&category=A&sort=price_asc");
    const { rerender } = render(<FilterBar categories={["A", "B"]} />);

    const [categorySelect, sortSelect] = screen.getAllByRole("combobox");
    expect(categorySelect).toHaveValue("A");
    expect(sortSelect).toHaveValue("price_asc");

    window.history.pushState({}, "", "/?filters=1&category=B&sort=price_desc");
    rerender(<FilterBar categories={["A", "B"]} />);

    await waitFor(() => {
      const [c2, s2] = screen.getAllByRole("combobox");
      expect(c2).toHaveValue("B");
      expect(s2).toHaveValue("price_desc");
    });
  });

  test("fechando via URL: mantém no DOM por ~320ms e depois desmonta", async () => {
    jest.useFakeTimers();
    window.history.pushState({}, "", "/?filters=1");

    const { rerender } = render(<FilterBar categories={[]} />);
    expect(screen.getByText("Reset filters")).toBeInTheDocument();

    // simula URL sem filters
    window.history.pushState({}, "", "/");
    rerender(<FilterBar categories={[]} />);

    // ainda existe (animando saída)
    expect(screen.getByText("Reset filters")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(320);
    });

    await waitFor(() => {
      expect(screen.queryByText("Reset filters")).toBeNull();
    });

    jest.useRealTimers();
  });
});
