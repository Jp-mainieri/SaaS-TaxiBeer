export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!session || user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, phone, whatsapp, address } = body ?? {};

    const establishment = await prisma.establishment.update({
      where: { id: params?.id ?? '' },
      data: { name, slug, phone: phone ?? '', whatsapp: whatsapp ?? '', address: address ?? '' },
    });

    return NextResponse.json(establishment);
  } catch (error) {
    console.error('Error updating establishment:', error);
    return NextResponse.json({ error: 'Erro ao atualizar loja' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!session || user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { active } = body ?? {};

    const establishment = await prisma.establishment.update({
      where: { id: params?.id ?? '' },
      data: { active },
    });

    return NextResponse.json(establishment);
  } catch (error) {
    console.error('Error toggling establishment:', error);
    return NextResponse.json({ error: 'Erro ao atualizar status' }, { status: 500 });
  }
}
