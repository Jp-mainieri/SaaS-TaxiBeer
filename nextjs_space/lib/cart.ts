import { ProductType } from '@prisma/client';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  type: ProductType;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

const CART_KEY = 'beer_delivery_cart';

export function getCart(slug: string): Cart {
  if (typeof window === 'undefined') return { items: [], total: 0 };
  try {
    const data = localStorage.getItem(`${CART_KEY}_${slug}`);
    if (data) {
      return JSON.parse(data);
    }
  } catch {}
  return { items: [], total: 0 };
}

export function saveCart(slug: string, cart: Cart): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${CART_KEY}_${slug}`, JSON.stringify(cart));
  } catch {}
}

export function addToCart(slug: string, item: Omit<CartItem, 'quantity'>): Cart {
  const cart = getCart(slug);
  const existingIndex = (cart?.items ?? []).findIndex((i) => i?.id === item?.id);

  if (existingIndex >= 0) {
    cart.items[existingIndex].quantity += 1;
  } else {
    cart.items.push({ ...item, quantity: 1 });
  }

  cart.total = (cart?.items ?? []).reduce((sum: number, i: CartItem) => sum + (i?.price ?? 0) * (i?.quantity ?? 0), 0);
  saveCart(slug, cart);
  return cart;
}

export function updateQuantity(slug: string, itemId: string, quantity: number): Cart {
  const cart = getCart(slug);
  const index = (cart?.items ?? []).findIndex((i) => i?.id === itemId);

  if (index >= 0) {
    if (quantity <= 0) {
      cart.items.splice(index, 1);
    } else {
      cart.items[index].quantity = quantity;
    }
  }

  cart.total = (cart?.items ?? []).reduce((sum: number, i: CartItem) => sum + (i?.price ?? 0) * (i?.quantity ?? 0), 0);
  saveCart(slug, cart);
  return cart;
}

export function clearCart(slug: string): Cart {
  const emptyCart = { items: [], total: 0 };
  saveCart(slug, emptyCart);
  return emptyCart;
}
