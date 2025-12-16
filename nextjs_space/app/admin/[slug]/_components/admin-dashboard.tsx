'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Image from 'next/image';
import { Beer, Package, ShoppingBag, Tag, LogOut, Plus, Edit, Trash2, Check, X, Loader2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface Props {
  establishment: any;
}

export default function AdminDashboard({ establishment }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'categories'>('orders');
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const orders = establishment?.orders ?? [];
  const products = establishment?.products ?? [];
  const categories = establishment?.categories ?? [];

  const pendingOrders = orders.filter((o: any) => o?.status === 'PENDING')?.length ?? 0;

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-amber-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Beer className="h-8 w-8" />
            <div>
              <h1 className="font-bold text-lg">{establishment?.name ?? 'Admin'}</h1>
              <p className="text-sm opacity-80">Painel Administrativo</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href={`/${establishment?.slug ?? ''}`} target="_blank">
              <Button variant="ghost" className="text-white hover:bg-amber-600">
                <Eye className="h-4 w-4 mr-2" /> Ver Loja
              </Button>
            </a>
            <Button variant="ghost" className="text-white hover:bg-amber-600" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" /> Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 flex gap-1">
          {[
            { id: 'orders', label: 'Pedidos', icon: ShoppingBag, badge: pendingOrders },
            { id: 'products', label: 'Produtos', icon: Package },
            { id: 'categories', label: 'Categorias', icon: Tag },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-600 hover:text-amber-500'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {(tab?.badge ?? 0) > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'orders' && (
          <OrdersTab orders={orders} onRefresh={() => router.refresh()} />
        )}
        {activeTab === 'products' && (
          <ProductsTab
            products={products}
            categories={categories}
            establishmentId={establishment?.id}
            onRefresh={() => router.refresh()}
          />
        )}
        {activeTab === 'categories' && (
          <CategoriesTab
            categories={categories}
            establishmentId={establishment?.id}
            onRefresh={() => router.refresh()}
          />
        )}
      </main>
    </div>
  );
}

function OrdersTab({ orders, onRefresh }: { orders: any[]; onRefresh: () => void }) {
  const [loading, setLoading] = useState<string | null>(null);

  const updateStatus = async (orderId: string, status: string) => {
    setLoading(orderId);
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      onRefresh();
    } catch {}
    setLoading(null);
  };

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    ACCEPTED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Pedidos Recentes</h2>
      {(orders?.length ?? 0) === 0 ? (
        <Card><CardContent className="py-12 text-center text-gray-500">Nenhum pedido ainda</CardContent></Card>
      ) : (
        orders.map((order: any) => (
          <Card key={order?.id} className="overflow-hidden">
            <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-bold">#{order?.orderNumber ?? '---'}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order?.status ?? 'PENDING'] ?? ''}`}>
                    {order?.status === 'PENDING' ? 'Pendente' : order?.status === 'ACCEPTED' ? 'Aceito' : 'Recusado'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {order?.type === 'DELIVERY' ? 'Entrega' : 'Retirada'}
                  </span>
                </div>
                <p className="text-sm"><strong>{order?.customerName ?? ''}</strong> - {order?.customerPhone ?? ''}</p>
                {order?.address && <p className="text-sm text-gray-500">{order.address}</p>}
                <p className="text-sm text-gray-500">{order?.date ?? ''} às {order?.time ?? ''}</p>
                <div className="mt-2 text-sm">
                  {(order?.items ?? []).map((item: any) => (
                    <span key={item?.id} className="mr-2">{item?.quantity ?? 0}x {item?.product?.name ?? ''}</span>
                  ))}
                </div>
                <p className="font-bold text-amber-600 mt-2">R$ {(order?.total ?? 0).toFixed(2)}</p>
              </div>
              {order?.status === 'PENDING' && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="text-green-600 border-green-600 hover:bg-green-50"
                    onClick={() => updateStatus(order?.id, 'ACCEPTED')}
                    disabled={loading === order?.id}
                  >
                    {loading === order?.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4 mr-1" /> Aceitar</>}
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-600 hover:bg-red-50"
                    onClick={() => updateStatus(order?.id, 'REJECTED')}
                    disabled={loading === order?.id}
                  >
                    <X className="h-4 w-4 mr-1" /> Recusar
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))
      )}
    </div>
  );
}

function ProductsTab({ products, categories, establishmentId, onRefresh }: any) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    categoryId: '',
    type: 'SALE',
    featured: false,
  });

  const openModal = (product?: any) => {
    if (product) {
      setEditing(product);
      setForm({
        name: product?.name ?? '',
        description: product?.description ?? '',
        price: String(product?.price ?? ''),
        image: product?.image ?? '',
        categoryId: product?.categoryId ?? '',
        type: product?.type ?? 'SALE',
        featured: product?.featured ?? false,
      });
    } else {
      setEditing(null);
      setForm({ name: '', description: '', price: '', image: '', categoryId: categories?.[0]?.id ?? '', type: 'SALE', featured: false });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = editing ? 'PUT' : 'POST';
      const url = editing ? `/api/admin/products/${editing.id}` : '/api/admin/products';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, price: parseFloat(form.price) || 0, establishmentId }),
      });
      setShowModal(false);
      onRefresh();
    } catch {}
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir produto?')) return;
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Produtos ({products?.length ?? 0})</h2>
        <Button onClick={() => openModal()}><Plus className="h-4 w-4 mr-2" /> Novo Produto</Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(products ?? []).map((product: any) => (
          <Card key={product?.id} className="overflow-hidden">
            <div className="relative aspect-video bg-gray-100">
              {product?.image ? (
                <Image src={product.image} alt={product?.name ?? ''} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><Package className="h-8 w-8 text-gray-300" /></div>
              )}
              {product?.featured && (
                <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-1 rounded">Destaque</span>
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold">{product?.name ?? ''}</h3>
              <p className="text-sm text-gray-500">{product?.category?.name ?? ''}</p>
              <p className="text-amber-600 font-bold">R$ {(product?.price ?? 0).toFixed(2)}</p>
              <div className="flex gap-2 mt-3">
                <Button variant="outline" size="sm" onClick={() => openModal(product)}><Edit className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" className="text-red-500" onClick={() => handleDelete(product?.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{editing ? 'Editar' : 'Novo'} Produto</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome</label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Descrição</label>
                  <textarea className="w-full rounded-lg border px-3 py-2" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Preço</label>
                    <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Categoria</label>
                    <select className="w-full rounded-lg border px-3 py-2" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
                      {(categories ?? []).map((c: any) => <option key={c?.id} value={c?.id}>{c?.name ?? ''}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">URL da Imagem</label>
                  <Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://i.ytimg.com/vi/jSzPtJarS8w/maxresdefault.jpg" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tipo</label>
                    <select className="w-full rounded-lg border px-3 py-2" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                      <option value="SALE">Venda</option>
                      <option value="RENTAL">Aluguel</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4" />
                    <label>Destaque</label>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
                  <Button type="submit" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function CategoriesTab({ categories, establishmentId, onRefresh }: any) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const openModal = (cat?: any) => {
    setEditing(cat ?? null);
    setName(cat?.name ?? '');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = editing ? 'PUT' : 'POST';
      const url = editing ? `/api/admin/categories/${editing.id}` : '/api/admin/categories';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, establishmentId }),
      });
      setShowModal(false);
      onRefresh();
    } catch {}
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir categoria?')) return;
    await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Categorias ({categories?.length ?? 0})</h2>
        <Button onClick={() => openModal()}><Plus className="h-4 w-4 mr-2" /> Nova Categoria</Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(categories ?? []).map((cat: any) => (
          <Card key={cat?.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{cat?.name ?? ''}</h3>
                <p className="text-sm text-gray-500">{cat?.products?.length ?? cat?._count?.products ?? 0} produtos</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openModal(cat)}><Edit className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" className="text-red-500" onClick={() => handleDelete(cat?.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{editing ? 'Editar' : 'Nova'} Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
                  <Button type="submit" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
