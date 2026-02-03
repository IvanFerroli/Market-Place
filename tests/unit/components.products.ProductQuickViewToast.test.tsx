/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { act } from "react-dom/test-utils";

// --- state controlado do carrinho (mock do hook)
let cartState: { items: any[] } = { items: [] };

// --- mocks (capturam chamadas)
const closeToastMock = jest.fn();

const ProductPriceMock = jest.fn(({ value }: { value: number }) => {
  return <span data-testid="price">{value}</span>;
});

const CartButtonMock = jest.fn((props: any) => {
  return (
    <button data-testid="cart-button" type="button" onClick={() => props.onAdded?.()}>
      Add to cart
    </button>
  );
});

const CartQuantityStepperMock = jest.fn((props: any) => {
  return (
    <div
      data-testid="qty-stepper"
      data-productid={props.productId}
      data-qty={props.quantity}
    />
  );
});

// --- next/image mock (vira <img/> normal)
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    const src = typeof props.src === "string" ? props.src : "";
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={props.alt} src={src} data-testid="product-image" />;
  },
}));

jest.mock("@/lib/cart/store", () => ({
  useCartSnapshot: () => cartState,
}));

jest.mock("@/lib/toast/events", () => ({
  closeToast: (id: string) => closeToastMock(id),
}));

jest.mock("@/components/products/ProductPrice", () => ({
  __esModule: true,
  default: (props: any) => ProductPriceMock(props),
}));

jest.mock("@/components/cart/CartButton", () => ({
  __esModule: true,
  default: (props: any) => CartButtonMock(props),
}));

jest.mock("@/components/cart/CartQuantityStepper", () => ({
  __esModule: true,
  default: (props: any) => CartQuantityStepperMock(props),
}));

// Badge/Button simples pra não depender do estilo/implementação real
jest.mock("@/components/ui/Badge", () => ({
  __esModule: true,
  default: ({ children }: any) => <span>{children}</span>,
}));

jest.mock("@/components/ui/Button", () => ({
  __esModule: true,
  default: ({ children, onClick, ...rest }: any) => (
    <button type="button" onClick={onClick} {...rest}>
      {children}
    </button>
  ),
}));

import ProductQuickViewToast from "@/components/products/ProductQuickViewToast";

function makeProduct() {
  return {
    id: "p1",
    name: "Neuro-Link",
    category: "Cyberware",
    stock: 3,
    priceCents: 15000,
    description: "Neural interface",
    image: "/x.png",
  } as any;
}

describe("ProductQuickViewToast", () => {
  beforeEach(() => {
    cartState = { items: [] };
    jest.clearAllMocks();
    CartButtonMock.mockClear();
    CartQuantityStepperMock.mockClear();
    ProductPriceMock.mockClear();
    closeToastMock.mockClear();
  });

  test("render básico: nome, badges, imagem, preço e descrição", () => {
    const product = makeProduct();
    render(<ProductQuickViewToast product={product} />);

    expect(screen.getByText("Neuro-Link")).toBeInTheDocument();
    expect(screen.getByText("Cyberware")).toBeInTheDocument();
    expect(screen.getByText("Stock: 3")).toBeInTheDocument();

    expect(screen.getByTestId("product-image")).toHaveAttribute("alt", "Neuro-Link");

    expect(screen.getByTestId("price")).toHaveTextContent("15000");
    expect(ProductPriceMock).toHaveBeenCalledWith(
      expect.objectContaining({ value: 15000 }),
    );

    expect(screen.getByText("Neural interface")).toBeInTheDocument();
  });

  test("Close chama closeToast com product:<id>", () => {
    const product = makeProduct();
    render(<ProductQuickViewToast product={product} />);

    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(closeToastMock).toHaveBeenCalledWith("product:p1");
  });

  test("quando qtyInCart > 0: mostra In cart + stepper e não mostra CartButton", () => {
    const product = makeProduct();

    cartState = {
      items: [{ product: { id: "p1" }, quantity: 2 }],
    };

    render(<ProductQuickViewToast product={product} />);

    expect(screen.getByText(/in cart:/i)).toBeInTheDocument();
    expect(screen.getByTestId("qty-stepper")).toHaveAttribute("data-productid", "p1");
    expect(screen.getByTestId("qty-stepper")).toHaveAttribute("data-qty", "2");

    expect(screen.queryByTestId("cart-button")).toBeNull();
  });

  test("quando qtyInCart = 0: mostra CartButton e feedback 'Added' por 1200ms", () => {
    jest.useFakeTimers();

    const product = makeProduct();
    cartState = { items: [] };

    render(<ProductQuickViewToast product={product} />);

    // CartButton presente e openCartOnAdd=false
    expect(screen.getByTestId("cart-button")).toBeInTheDocument();
    expect(CartButtonMock).toHaveBeenCalledWith(
      expect.objectContaining({ openCartOnAdd: false }),
    );

    fireEvent.click(screen.getByTestId("cart-button"));
    expect(screen.getByText(/added to cart/i)).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1200);
    });

    expect(screen.queryByText(/added to cart/i)).toBeNull();
    expect(screen.getByText(/add more or tap cart to review/i)).toBeInTheDocument();

    jest.useRealTimers();
  });
});
