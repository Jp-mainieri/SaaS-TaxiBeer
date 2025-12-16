import Link from 'next/link';
import { Beer, Store, ShoppingBag, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-100 to-amber-50">
      <header className="sticky top-0 z-50 bg-amber-500/95 backdrop-blur shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Beer className="h-8 w-8 text-white" />
            <span className="text-xl font-bold text-white">Beer Delivery</span>
          </div>
          <div className="flex gap-2">
            <Link href="/login">
              <Button variant="outline" className="bg-white/10 border-white text-white hover:bg-white/20">
                Entrar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-16">
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Plataforma de <span className="text-amber-600">Delivery de Bebidas</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Sistema completo para gerenciar seu delivery de cervejas, drinks e aluguel de barris de chopp.
          </p>
        </section>

        <section className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <Store className="h-12 w-12 text-amber-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Multi-Tenant</h3>
            <p className="text-gray-600">Cada estabelecimento tem sua própria loja personalizada.</p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <ShoppingBag className="h-12 w-12 text-amber-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Gestão Completa</h3>
            <p className="text-gray-600">Produtos, categorias, pedidos e clientes em um só lugar.</p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <Truck className="h-12 w-12 text-amber-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Delivery & Retirada</h3>
            <p className="text-gray-600">Opções de entrega ou retirada no local.</p>
          </div>
        </section>

        <section className="text-center bg-amber-500 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Acesse uma Loja de Exemplo</h2>
          <p className="mb-6">Veja o Taxi Beer em funcionamento</p>
          <Link href="/taxi-beer">
            <Button size="lg" className="bg-white text-amber-600 hover:bg-amber-100">
              <Beer className="mr-2 h-5 w-5" />
              Visitar Taxi Beer
            </Button>
          </Link>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-400">© 2025 Beer Delivery SaaS. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
