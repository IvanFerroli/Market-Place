export type Product = {
  id: string; // canonical id (string)
  name: string;
  priceCents: number; // canonical money (int, in cents)
  description: string;
  image: string;
  category: string;
  stock: number;
};
