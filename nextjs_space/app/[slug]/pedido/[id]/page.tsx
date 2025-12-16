'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Beer, ArrowLeft, Clock, CheckCircle, XCircle, Loader2, Package, MapPin, Phone, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function OrderStatusPage() {
  const params = useParams();
  const slug = (params?.slug as string) ?? '';
  const orderId = (params?.id as string) ?? '';

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [orderId]);

  const statusConfig: Record<string, { icon: any; color: string; label: string; bg: string }> = {
    PENDING: { icon: Clock, color: 'text-yellow-500', label: 'Pendente', bg: 'bg-yellow-100' },
    ACCEPTED: { icon: CheckCircle, color: 'text-green-500', label: 'Aceito', bg: 'bg-green-100' },
    REJECTED: { icon: XCircle, color: 'text-red-500', label: 'Recusado', bg: 'bg-red-100' },
  };

  const status = statusConfig[order?.status ?? 'PENDING'] ?? statusConfig.PENDING;
  const StatusIcon = status?.icon ?? Clock;

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!order || order?.error) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-12">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Pedido não encontrado</h2>
            <Link href={`/${slug}`}>
              <Button className="mt-4">Voltar à Loja</Button>
            </Link>
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
            <span className="font-bold">Pedido #{order?.orderNumber ?? '---'}</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Status Card */}
        <Card className={`${status?.bg ?? ''}`}>
          <CardContent className="py-8 text-center">
            <StatusIcon className={`h-16 w-16 mx-auto mb-4 ${status?.color ?? ''}`} />
            <h2 className="text-2xl font-bold mb-2">Status: {status?.label ?? 'Pendente'}</h2>
            <p className="text-gray-600">
              {order?.status === 'PENDING' && 'Aguardando confirmação do estabelecimento'}
              {order?.status === 'ACCEPTED' && 'Seu pedido foi aceito e está sendo preparado!'}
              {order?.status === 'REJECTED' && 'Infelizmente seu pedido foi recusado'}
            </p>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card>
          <CardContent className="py-6 space-y-4">
            <h3 className="text-lg font-semibold">Detalhes do Pedido</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-sm text-gray-500">Tipo</p>
                  <p className="font-medium">{order?.type === 'DELIVERY' ? 'Entrega' : 'Retirada'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-sm text-gray-500">Data/Hora</p>
                  <p className="font-medium">{order?.date ?? '--'} às {order?.time ?? '--'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-sm text-gray-500">Telefone</p>
                  <p className="font-medium">{order?.customerPhone ?? '--'}</p>
                </div>
              </div>
              {order?.address && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="text-sm text-gray-500">Endereço</p>
                    <p className="font-medium">{order.address}</p>
                  </div>
                </div>
              )}
            </div>
            {order?.notes && (
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500">Observações</p>
                <p>{order.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardContent className="py-6">
            <h3 className="text-lg font-semibold mb-4">Itens</h3>
            <div className="space-y-3">
              {(order?.items ?? []).map((item: any) => (
                <div key={item?.id} className="flex justify-between">
                  <span>{item?.quantity ?? 0}x {item?.product?.name ?? 'Produto'}</span>
                  <span className="font-medium">R$ {((item?.price ?? 0) * (item?.quantity ?? 0)).toFixed(2)}</span>
                </div>
              ))}
              <hr />
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-amber-600">R$ {(order?.total ?? 0).toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href={`/${slug}`}>
            <Button variant="outline">Voltar à Loja</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
