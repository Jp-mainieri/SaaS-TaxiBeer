import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import AdminDashboard from './_components/admin-dashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage({ params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!session || !user) {
    redirect('/login');
  }

  if (user?.role === 'SUPER_ADMIN') {
    // Super admin can access any store
  } else if (user?.establishmentSlug !== params?.slug) {
    redirect('/login');
  }

  const establishment = await prisma.establishment.findUnique({
    where: { slug: params?.slug ?? '' },
    include: {
      categories: { orderBy: { order: 'asc' } },
      products: { include: { category: true }, orderBy: { createdAt: 'desc' } },
      orders: {
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  });

  if (!establishment) {
    redirect('/login');
  }

  return <AdminDashboard establishment={establishment} />;
}
