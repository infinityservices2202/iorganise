import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const favorites = await db.favorite.findMany({
      where: { userId },
      include: {
        service: {
          include: {
            organizer: { include: { user: { select: { id: true, name: true, avatar: true } } } },
            category: true,
          },
        },
      },
    });

    const formatted = favorites.map((f) => ({
      ...f,
      service: {
        ...f.service,
        images: JSON.parse(f.service.images as string || '[]'),
      },
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Favorites fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, serviceId } = body;

    const existing = await db.favorite.findUnique({
      where: { userId_serviceId: { userId, serviceId } },
    });

    if (existing) {
      await db.favorite.delete({ where: { id: existing.id } });
      return NextResponse.json({ isFavorite: false });
    }

    await db.favorite.create({ data: { userId, serviceId } });
    return NextResponse.json({ isFavorite: true });
  } catch (error) {
    console.error('Favorite toggle error:', error);
    return NextResponse.json({ error: 'Failed to toggle favorite' }, { status: 500 });
  }
}
