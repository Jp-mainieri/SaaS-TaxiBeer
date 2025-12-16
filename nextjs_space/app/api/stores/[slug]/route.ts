export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params?.slug;
    if (!slug) {
      return NextResponse.json({ error: 'Slug obrigatório' }, { status: 400 });
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

    if (!establishment || !establishment.active) {
      return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 });
    }

    return NextResponse.json(establishment);
  } catch (error) {
    console.error('Error fetching store:', error);
    return NextResponse.json({ error: 'Erro ao buscar loja' }, { status: 500 });
  }
}
