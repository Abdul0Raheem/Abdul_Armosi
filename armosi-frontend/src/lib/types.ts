export interface Product {
  id: number | string;
  name: string;
  price: number;
  mrp?: number;
  emoji?: string;
  bg?: string;
  image?: string;
  category?: string;
}

export interface CartItem extends Product {
  qty: number;
}

export interface CustomItem {
  name: string;
  sub: string;
  emoji: string;
  bg: string;
}
