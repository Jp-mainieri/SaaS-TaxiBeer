export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, price, image, categoryId, type, featured, establishmentId } = body ?? {};

    if (!name || !categoryId || !establishmentId) {
      return NextResponse.json({ error: 'Dados obrigatórios' }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description ?? '',
        price: price ?? 0,
        image: image ?? '',
        categoryId,
        type: type ?? 'SALE',
        featured: featured ?? false,
        establishmentId,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Erro ao criar produto' }, { status: 500 });
  }
}
