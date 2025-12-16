import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import StoreClient from './_components/store-client';

export const dynamic = 'force-dynamic';

export default async function StorePage({ params }: { params: { slug: string } }) {
  const slug = params?.slug;
  
  if (!slug || slug === 'admin' || slug === 'super-admin' || slug === 'login' || slug === 'api') {
    notFound();
  }

  const establishment = await prisma.establishment.findUnique({
    where: { slug },
    include: {
      categories: {
        orderBy: { order: 'asc' },
        include: {
          products: {
            where: { active: true },
            orderBy: { createdAt: 'desc' },
          },
        },
      },
      products: {
        where: { active: true, featured: true },
        orderBy: { createdAt: 'desc' },
        take: 6,
      },
    },
  });

  if (!establishment || !establishment?.active) {
    notFound();
  }

  // Transform null to undefined for optional fields
  const transformedEstablishment = {
    ...establishment,
    logo: establishment.logo ?? undefined,
    phone: establishment.phone ?? undefined,
    whatsapp: establishment.whatsapp ?? undefined,
    address: establishment.address ?? undefined,
    categories: establishment.categories.map((cat: any) => ({
      ...cat,
      products: cat.products.map(p => ({
        ...p,
        description: p.description ?? undefined,
        image: p.image ?? undefined,
      }))
    })),
    products: establishment.products.map(p => ({
      ...p,
      description: p.description ?? undefined,
      image: p.image ?? undefined,
    }))
  };

  return <StoreClient establishment={transformedEstablishment as any} />;
}
