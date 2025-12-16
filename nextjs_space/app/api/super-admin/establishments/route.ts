export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!session || user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, phone, whatsapp, address } = body ?? {};

    if (!name || !slug) {
      return NextResponse.json({ error: 'Nome e slug obrigatórios' }, { status: 400 });
    }

    const existing = await prisma.establishment.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: 'Slug já existe' }, { status: 400 });
    }

    const establishment = await prisma.establishment.create({
      data: { name, slug, phone: phone ?? '', whatsapp: whatsapp ?? '', address: address ?? '' },
    });

    return NextResponse.json(establishment, { status: 201 });
  } catch (error) {
    console.error('Error creating establishment:', error);
    return NextResponse.json({ error: 'Erro ao criar loja' }, { status: 500 });
  }
}
