/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SearchBar from "@/components/search/SearchBar";

const replaceMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
  useSearchParams: () => new URLSearchParams(window.location.search),
}));

jest.mock("@/components/ui/Input", () => {
  return function MockInput(props: any) {
    return (
      <input
        aria-label="SearchBarInput"
        value={props.value ?? ""}
        placeholder={props.placeholder}
        className={props.className}
        onChange={(e) => props.onChange?.((e.target as HTMLInputElement).value)}
      />
    );
  };
});

describe("SearchBar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.history.pushState({}, "", "/");
  });

  test("inicializa o input com o valor da URL (paramKey default=q)", () => {
    window.history.pushState({}, "", "/?q=neo&x=1");
    render(<SearchBar />);

    expect(screen.getByLabelText("SearchBarInput")).toHaveValue("neo");
  });

  test("debounce: escreve e faz router.replace com trim + preserva outros params", async () => {
    jest.useFakeTimers();
    window.history.pushState({}, "", "/?q=neo&x=1");

    render(<SearchBar debounceMs={50} />);

    fireEvent.change(screen.getByLabelText("SearchBarInput"), {
      target: { value: "  z  " },
    });

    expect(replaceMock).not.toHaveBeenCalled();

    jest.advanceTimersByTime(49);
    expect(replaceMock).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);

    expect(replaceMock).toHaveBeenCalledTimes(1);
    expect(replaceMock).toHaveBeenCalledWith("/?q=z&x=1", { scroll: false });

    jest.useRealTimers();
  });

  test("quando input fica vazio/whitespace: remove paramKey (mantém os demais)", () => {
    jest.useFakeTimers();
    window.history.pushState({}, "", "/?q=neo&x=1");

    render(<SearchBar debounceMs={10} />);

    fireEvent.change(screen.getByLabelText("SearchBarInput"), {
      target: { value: "   " },
    });

    jest.advanceTimersByTime(10);

    expect(replaceMock).toHaveBeenCalledWith("/?x=1", { scroll: false });

    jest.useRealTimers();
  });

  test("quando não sobra querystring: replace vira targetPath puro", () => {
    jest.useFakeTimers();
    window.history.pushState({}, "", "/?q=neo");

    render(<SearchBar debounceMs={10} targetPath="/shop" />);

    fireEvent.change(screen.getByLabelText("SearchBarInput"), {
      target: { value: "" },
    });

    jest.advanceTimersByTime(10);

    expect(replaceMock).toHaveBeenCalledWith("/shop", { scroll: false });

    jest.useRealTimers();
  });

  test("dedupe do debounce: digitar 2x rápido -> só 1 replace (último valor)", () => {
    jest.useFakeTimers();
    window.history.pushState({}, "", "/?q=a");

    render(<SearchBar debounceMs={50} />);

    const input = screen.getByLabelText("SearchBarInput");

    fireEvent.change(input, { target: { value: "ab" } });
    fireEvent.change(input, { target: { value: "abc" } });

    jest.advanceTimersByTime(50);

    expect(replaceMock).toHaveBeenCalledTimes(1);
    expect(replaceMock).toHaveBeenCalledWith("/?q=abc", { scroll: false });

    jest.useRealTimers();
  });

  test("custom props: paramKey e targetPath", () => {
    jest.useFakeTimers();
    window.history.pushState({}, "", "/?search=hi");

    render(<SearchBar paramKey="search" targetPath="/products" debounceMs={10} />);

    fireEvent.change(screen.getByLabelText("SearchBarInput"), {
      target: { value: "yo" },
    });

    jest.advanceTimersByTime(10);

    expect(replaceMock).toHaveBeenCalledWith("/products?search=yo", { scroll: false });

    jest.useRealTimers();
  });

  test("sync: se URL mudar (back/forward), input acompanha", async () => {
    window.history.pushState({}, "", "/?q=one");
    const { rerender } = render(<SearchBar />);

    expect(screen.getByLabelText("SearchBarInput")).toHaveValue("one");

    window.history.pushState({}, "", "/?q=two");
    rerender(<SearchBar />);

    await waitFor(() => {
      expect(screen.getByLabelText("SearchBarInput")).toHaveValue("two");
    });
  });

  test("cleanup: unmount limpa timer e não chama replace depois", () => {
    jest.useFakeTimers();
    window.history.pushState({}, "", "/?q=neo");

    const { unmount } = render(<SearchBar debounceMs={50} />);
    fireEvent.change(screen.getByLabelText("SearchBarInput"), {
      target: { value: "x" },
    });

    unmount();
    jest.advanceTimersByTime(50);

    expect(replaceMock).not.toHaveBeenCalled();

    jest.useRealTimers();
  });
});
