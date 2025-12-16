import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import SuperAdminDashboard from './_components/super-admin-dashboard';

export const dynamic = 'force-dynamic';

export default async function SuperAdminPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!session || user?.role !== 'SUPER_ADMIN') {
    redirect('/login');
  }

  const establishments = await prisma.establishment.findMany({
    include: {
      _count: { select: { orders: true, products: true } },
      users: { where: { role: 'STORE_ADMIN' }, select: { id: true, email: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const stats = {
    totalEstablishments: establishments?.length ?? 0,
    totalOrders: await prisma.order.count(),
    pendingOrders: await prisma.order.count({ where: { status: 'PENDING' } }),
  };

  return <SuperAdminDashboard establishments={establishments} stats={stats} />;
}
