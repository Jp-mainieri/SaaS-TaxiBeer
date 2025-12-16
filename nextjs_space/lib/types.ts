import { UserRole, ProductType, OrderStatus, OrderType } from '@prisma/client';

export type { UserRole, ProductType, OrderStatus, OrderType };

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

export interface SessionUser {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  establishmentId?: string;
  establishmentSlug?: string;
}

declare module 'next-auth' {
  interface Session {
    user: SessionUser;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    establishmentId?: string;
    establishmentSlug?: string;
  }
}
