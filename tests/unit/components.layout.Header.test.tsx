/**
 * @jest-environment jsdom
 */

import { render, screen, act } from "@testing-library/react";
import Header from "@/components/layout/Header";

jest.mock("next/image", () => (props: any) => {
  const { alt, src, className, width, height } = props;
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      alt={alt}
      src={typeof src === "string" ? src : ""}
      className={className}
      width={width}
      height={height}
    />
  );
});

jest.mock("next/link", () => (props: any) => {
  const { href, children, ...rest } = props;
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
});

jest.mock("@/components/layout/Container", () => (props: any) => (
  <div data-testid="container" {...props} />
));

jest.mock("@/components/cart/CartButton", () => () => (
  <button type="button">Cart</button>
));

jest.mock("@/components/cart/CartBadge", () => () => (
  <div data-testid="cart-badge">badge</div>
));

jest.mock("@/components/cart/FiltersToggleButton", () => () => (
  <button type="button">Filters</button>
));

jest.mock("@/components/layout/ScrollProgressBar", () => () => (
  <div data-testid="scroll-progress">progress</div>
));

jest.mock("@/components/search/SearchBar", () => (props: any) => (
  <input aria-label="Search" placeholder={props?.placeholder} />
));

jest.mock("@/components/search/FilterBar", () => (props: any) => (
  <div data-testid="filter-bar">{JSON.stringify(props?.categories ?? [])}</div>
));

describe("Header", () => {
  beforeEach(() => {
    jest.restoreAllMocks();

    Object.defineProperty(window, "scrollY", {
      value: 0,
      writable: true,
      configurable: true,
    });

    // roda RAF na hora pra teste do scroll não ficar flakey
    (window as any).requestAnimationFrame = (cb: any) => {
      cb(0);
      return 1;
    };
    (window as any).cancelAnimationFrame = () => {};
  });

  test("renders key composition (brand link, search, filterbar, cart actions)", () => {
    render(<Header categories={["weapons", "implants"]} />);

    expect(screen.getByLabelText("NCART home")).toBeInTheDocument();

    // actions
    expect(screen.getByRole("button", { name: "Cart" })).toBeInTheDocument();
    expect(screen.getByTestId("cart-badge")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Filters" })).toBeInTheDocument();

    // search
    expect(screen.getByLabelText("Search")).toHaveAttribute(
      "placeholder",
      "Search products…",
    );

    // filterbar recebe categories
    expect(screen.getByTestId("filter-bar")).toHaveTextContent('["weapons","implants"]');

    // progress bar existe
    expect(screen.getByTestId("scroll-progress")).toBeInTheDocument();
  });

  test("toggles glass class when scrolling past threshold", () => {
    jest.useFakeTimers();

    (window as any).requestAnimationFrame = (cb: any) =>
      window.setTimeout(() => cb(0), 0);

    const { container } = render(<Header categories={[]} />);

    const headerEl = container.querySelector("header");
    expect(headerEl).toBeTruthy();

    expect(headerEl!.className).toMatch(/cp-glass\b/);
    expect(headerEl!.className).not.toMatch(/cp-glass-strong/);

    (window as any).scrollY = 100;

    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(headerEl!.className).toMatch(/cp-glass-strong/);

    jest.useRealTimers();
  });
});
