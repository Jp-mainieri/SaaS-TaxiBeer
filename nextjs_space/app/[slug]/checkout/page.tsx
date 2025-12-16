'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Beer, ArrowLeft, Truck, Store, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { getCart, clearCart, type Cart, type CartItem } from '@/lib/cart';

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) ?? '';

  const [cart, setCart] = useState<Cart>({ items: [], total: 0 });
  const [establishment, setEstablishment] = useState<any>(null);
  const [orderType, setOrderType] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    address: '',
    date: '',
    time: '',
    notes: '',
  });

  useEffect(() => {
    setCart(getCart(slug));
    fetch(`/api/stores/${slug}`)
      .then((res) => res.json())
      .then((data) => setEstablishment(data))
      .catch(() => {});
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((cart?.items?.length ?? 0) === 0) return;

    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          establishmentId: establishment?.id,
          ...form,
          type: orderType,
          items: cart?.items ?? [],
        }),
      });

      const data = await res.json();
      if (res.ok) {
        clearCart(slug);
        setOrderId(data?.id ?? '');
        setSuccess(true);
      }
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-12">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Pedido Realizado!</h2>
            <p className="text-gray-600 mb-6">Seu pedido foi enviado com sucesso.</p>
            <div className="space-y-2">
              <Link href={`/${slug}/pedido/${orderId}`}>
                <Button className="w-full">Acompanhar Pedido</Button>
              </Link>
              <Link href={`/${slug}`}>
                <Button variant="outline" className="w-full">Voltar à Loja</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50">
      <header className="bg-amber-500 text-white py-4 px-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href={`/${slug}`}>
            <Button variant="ghost" size="icon" className="text-white hover:bg-amber-600">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Beer className="h-6 w-6" />
            <span className="font-bold">Finalizar Pedido</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={orderType === 'DELIVERY' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setOrderType('DELIVERY')}
                  >
                    <Truck className="h-4 w-4 mr-2" /> Entrega
                  </Button>
                  <Button
                    type="button"
                    variant={orderType === 'PICKUP' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setOrderType('PICKUP')}
                  >
                    <Store className="h-4 w-4 mr-2" /> Retirada
                  </Button>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Nome *</label>
                  <Input
                    required
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    placeholder="Seu nome completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Telefone *</label>
                  <Input
                    required
                    value={form.customerPhone}
                    onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                {orderType === 'DELIVERY' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Endereço *</label>
                    <Input
                      required
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="Rua, número, bairro"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Data *</label>
                    <Input
                      type="date"
                      required
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Horário *</label>
                    <Input
                      type="time"
                      required
                      value={form.time}
                      onChange={(e) => setForm({ ...form, time: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Observações</label>
                  <textarea
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Alguma observação sobre o pedido?"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading || (cart?.items?.length ?? 0) === 0}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Confirmar Pedido'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Cart Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              {(cart?.items?.length ?? 0) === 0 ? (
                <p className="text-gray-500 text-center py-8">Carrinho vazio</p>
              ) : (
                <div className="space-y-4">
                  {(cart?.items ?? []).map((item: CartItem) => (
                    <div key={item?.id} className="flex gap-3">
                      {item?.image && (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image src={item.image} alt={item?.name ?? ''} fill className="object-cover" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{item?.name ?? ''}</p>
                        <p className="text-sm text-gray-500">{item?.quantity ?? 0}x R$ {(item?.price ?? 0).toFixed(2)}</p>
                      </div>
                      <p className="font-semibold">R$ {((item?.price ?? 0) * (item?.quantity ?? 0)).toFixed(2)}</p>
                    </div>
                  ))}
                  <hr />
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-amber-600">R$ {(cart?.total ?? 0).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
