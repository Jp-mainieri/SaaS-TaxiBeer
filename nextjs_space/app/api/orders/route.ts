export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      establishmentId,
      customerName,
      customerPhone,
      address,
      date,
      time,
      notes,
      type,
      items,
    } = body ?? {};

    if (!establishmentId || !customerName || !customerPhone || !date || !time || !items?.length) {
      return NextResponse.json({ error: 'Dados obrigatórios faltando' }, { status: 400 });
    }

    const total = (items ?? []).reduce(
      (sum: number, item: any) => sum + (item?.price ?? 0) * (item?.quantity ?? 0),
      0
    );

    const order = await prisma.order.create({
      data: {
        establishmentId,
        customerName,
        customerPhone,
        address: address ?? '',
        date,
        time,
        notes: notes ?? '',
        type: type ?? 'DELIVERY',
        total,
        items: {
          create: (items ?? []).map((item: any) => ({
            productId: item?.id,
            quantity: item?.quantity ?? 1,
            price: item?.price ?? 0,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Erro ao criar pedido' }, { status: 500 });
  }
}
