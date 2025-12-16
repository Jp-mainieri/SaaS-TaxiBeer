'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Beer, Store, Users, ShoppingBag, Plus, Edit, Power, LogOut, Loader2, Eye, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface Props {
  establishments: any[];
  stats: { totalEstablishments: number; totalOrders: number; pendingOrders: number };
}

export default function SuperAdminDashboard({ establishments, stats }: Props) {
  const router = useRouter();
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editingStore, setEditingStore] = useState<any>(null);
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [storeForm, setStoreForm] = useState({ name: '', slug: '', phone: '', whatsapp: '', address: '' });
  const [adminForm, setAdminForm] = useState({ email: '', password: '', name: '' });

  const openStoreModal = (store?: any) => {
    if (store) {
      setEditingStore(store);
      setStoreForm({
        name: store?.name ?? '',
        slug: store?.slug ?? '',
        phone: store?.phone ?? '',
        whatsapp: store?.whatsapp ?? '',
        address: store?.address ?? '',
      });
    } else {
      setEditingStore(null);
      setStoreForm({ name: '', slug: '', phone: '', whatsapp: '', address: '' });
    }
    setShowStoreModal(true);
  };

  const openAdminModal = (store: any) => {
    setSelectedStore(store);
    setAdminForm({ email: '', password: '', name: '' });
    setShowAdminModal(true);
  };

  const handleStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = editingStore ? 'PUT' : 'POST';
      const url = editingStore ? `/api/super-admin/establishments/${editingStore.id}` : '/api/super-admin/establishments';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storeForm),
      });
      setShowStoreModal(false);
      router.refresh();
    } catch {}
    setLoading(false);
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/super-admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...adminForm, establishmentId: selectedStore?.id }),
      });
      setShowAdminModal(false);
      router.refresh();
    } catch {}
    setLoading(false);
  };

  const toggleStoreStatus = async (store: any) => {
    await fetch(`/api/super-admin/establishments/${store?.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !store?.active }),
    });
    router.refresh();
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gray-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Beer className="h-8 w-8 text-amber-500" />
            <div>
              <h1 className="font-bold text-lg">Super Admin</h1>
              <p className="text-sm opacity-80">Gestão da Plataforma</p>
            </div>
          </div>
          <Button variant="ghost" className="text-white hover:bg-gray-800" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" /> Sair
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-full bg-amber-100">
                <Store className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Estabelecimentos</p>
                <p className="text-2xl font-bold">{stats?.totalEstablishments ?? 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100">
                <ShoppingBag className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total de Pedidos</p>
                <p className="text-2xl font-bold">{stats?.totalOrders ?? 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-full bg-yellow-100">
                <ShoppingBag className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pedidos Pendentes</p>
                <p className="text-2xl font-bold">{stats?.pendingOrders ?? 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Establishments */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Estabelecimentos</h2>
          <Button onClick={() => openStoreModal()}><Plus className="h-4 w-4 mr-2" /> Nova Loja</Button>
        </div>

        <div className="space-y-4">
          {(establishments ?? []).map((store: any) => (
            <Card key={store?.id} className={`${!store?.active ? 'opacity-60' : ''}`}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold">{store?.name ?? ''}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${store?.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {store?.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">/{store?.slug ?? ''}</p>
                    <p className="text-sm text-gray-500">{store?.phone ?? ''}</p>
                    <div className="flex gap-4 mt-2 text-sm">
                      <span><strong>{store?._count?.products ?? 0}</strong> produtos</span>
                      <span><strong>{store?._count?.orders ?? 0}</strong> pedidos</span>
                    </div>
                    {(store?.users?.length ?? 0) > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-400">Admins: {(store?.users ?? []).map((u: any) => u?.email).join(', ')}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a href={`/${store?.slug ?? ''}`} target="_blank">
                      <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-1" /> Ver</Button>
                    </a>
                    <a href={`/admin/${store?.slug ?? ''}`} target="_blank">
                      <Button variant="outline" size="sm"><Users className="h-4 w-4 mr-1" /> Admin</Button>
                    </a>
                    <Button variant="outline" size="sm" onClick={() => openAdminModal(store)}>
                      <UserPlus className="h-4 w-4 mr-1" /> Criar Admin
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openStoreModal(store)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={store?.active ? 'text-red-500' : 'text-green-500'}
                      onClick={() => toggleStoreStatus(store)}
                    >
                      <Power className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Store Modal */}
      {showStoreModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>{editingStore ? 'Editar' : 'Nova'} Loja</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStoreSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome</label>
                  <Input value={storeForm.name} onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Slug (URL)</label>
                  <Input value={storeForm.slug} onChange={(e) => setStoreForm({ ...storeForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} required placeholder="minha-loja" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Telefone</label>
                    <Input value={storeForm.phone} onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">WhatsApp</label>
                    <Input value={storeForm.whatsapp} onChange={(e) => setStoreForm({ ...storeForm, whatsapp: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Endereço</label>
                  <Input value={storeForm.address} onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })} />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowStoreModal(false)}>Cancelar</Button>
                  <Button type="submit" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Admin Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Criar Admin para {selectedStore?.name ?? ''}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome</label>
                  <Input value={adminForm.name} onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input type="email" value={adminForm.email} onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Senha</label>
                  <Input type="password" value={adminForm.password} onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })} required minLength={6} />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowAdminModal(false)}>Cancelar</Button>
                  <Button type="submit" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar'}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
