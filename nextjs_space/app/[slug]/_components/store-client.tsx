'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Beer, ShoppingCart, Plus, Minus, Trash2, MapPin, Phone, X, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getCart, addToCart, updateQuantity, clearCart, type Cart, type CartItem } from '@/lib/cart';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  image?: string | null;
  type: 'SALE' | 'RENTAL';
  featured: boolean;
}

interface Category {
  id: string;
  name: string;
  products: Product[];
}

interface Establishment {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  categories: Category[];
  products: Product[];
}

export default function StoreClient({ establishment }: { establishment: Establishment }) {
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 });
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    setCart(getCart(establishment?.slug ?? ''));
  }, [establishment?.slug]);

  const handleAddToCart = (product: Product) => {
    const newCart = addToCart(establishment?.slug ?? '', {
      id: product?.id ?? '',
      name: product?.name ?? '',
      price: product?.price ?? 0,
      image: product?.image ?? undefined,
      type: product?.type ?? 'SALE',
    });
    setCart(newCart);
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    const newCart = updateQuantity(establishment?.slug ?? '', itemId, quantity);
    setCart(newCart);
  };

  const handleClearCart = () => {
    setCart(clearCart(establishment?.slug ?? ''));
  };

  const cartCount = (cart?.items ?? []).reduce((sum: number, item: CartItem) => sum + (item?.quantity ?? 0), 0);
  const featuredProducts = establishment?.products ?? [];
  const categories = establishment?.categories ?? [];

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-amber-500/95 backdrop-blur shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {establishment?.logo ? (
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white">
                <Image src={establishment.logo} alt={establishment?.name ?? ''} fill className="object-cover" />
              </div>
            ) : (
              <Beer className="h-8 w-8 text-white" />
            )}
            <span className="text-xl font-bold text-white">{establishment?.name ?? 'Loja'}</span>
          </div>
          <Button
            onClick={() => setShowCart(true)}
            className="bg-white text-amber-600 hover:bg-amber-100 relative"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Button>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-amber-600 to-amber-500 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{establishment?.name ?? 'Loja'}</h1>
          <div className="flex flex-wrap gap-4 text-sm">
            {establishment?.address && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {establishment.address}
              </span>
            )}
            {establishment?.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-4 w-4" /> {establishment.phone}
              </span>
            )}
          </div>
          <div className="mt-6 bg-white/20 rounded-xl p-6 backdrop-blur">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Package className="h-6 w-6" /> Aluguel de Barris de Chopp
            </h2>
            <p className="mt-2 opacity-90">Alugue barris de chopp com chopeira inclusa para sua festa!</p>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts?.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Beer className="h-6 w-6 text-amber-500" /> Destaques
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product?.id} product={product} onAdd={handleAddToCart} />
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.map((category) => (
        (category?.products?.length ?? 0) > 0 && (
          <section key={category?.id} className="max-w-6xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-6">{category?.name ?? 'Categoria'}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {(category?.products ?? []).map((product) => (
                <ProductCard key={product?.id} product={product} onAdd={handleAddToCart} />
              ))}
            </div>
          </section>
        )
      ))}

      {/* Cart Sidebar */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowCart(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
            >
              <div className="p-4 border-b flex items-center justify-between bg-amber-500 text-white">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <ShoppingCart className="h-6 w-6" /> Carrinho
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setShowCart(false)} className="text-white hover:bg-amber-600">
                  <X className="h-6 w-6" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {(cart?.items?.length ?? 0) === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Seu carrinho está vazio</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(cart?.items ?? []).map((item: CartItem) => (
                      <div key={item?.id} className="flex gap-3 bg-gray-50 rounded-lg p-3">
                        {item?.image && (
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                            <Image src={item.image} alt={item?.name ?? ''} fill className="object-cover" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item?.name ?? ''}</p>
                          <p className="text-amber-600 font-semibold">R$ {(item?.price ?? 0).toFixed(2)}</p>
                          {item?.type === 'RENTAL' && (
                            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">Aluguel</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleUpdateQuantity(item?.id ?? '', (item?.quantity ?? 0) - 1)}
                          >
                            {(item?.quantity ?? 0) === 1 ? <Trash2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                          </Button>
                          <span className="w-6 text-center">{item?.quantity ?? 0}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleUpdateQuantity(item?.id ?? '', (item?.quantity ?? 0) + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {(cart?.items?.length ?? 0) > 0 && (
                <div className="border-t p-4 space-y-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-amber-600">R$ {(cart?.total ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={handleClearCart}>
                      Limpar
                    </Button>
                    <Link href={`/${establishment?.slug ?? ''}/checkout`} className="flex-1">
                      <Button className="w-full">Finalizar Pedido</Button>
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-400">© 2025 {establishment?.name ?? 'Loja'}. Powered by Beer Delivery SaaS.</p>
        </div>
      </footer>
    </div>
  );
}

function ProductCard({ product, onAdd }: { product: Product; onAdd: (p: Product) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
        <div className="relative aspect-square bg-gray-100">
          {product?.image ? (
            <Image
              src={product.image}
              alt={product?.name ?? ''}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Beer className="h-12 w-12 text-gray-300" />
            </div>
          )}
          {product?.type === 'RENTAL' && (
            <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              Aluguel
            </span>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold truncate">{product?.name ?? ''}</h3>
          {product?.description && (
            <p className="text-sm text-gray-500 line-clamp-2 mt-1">{product.description}</p>
          )}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-lg font-bold text-amber-600">R$ {(product?.price ?? 0).toFixed(2)}</span>
            <Button size="sm" onClick={() => onAdd(product)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
