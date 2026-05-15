import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const city = searchParams.get('city');
    const isVerified = searchParams.get('isVerified');

    const where: Record<string, unknown> = {};
    if (city) where.city = { contains: city };
    if (isVerified === 'true') where.isVerified = true;

    if (id) {
      const organizer = await db.organizerProfile.findUnique({
        where: { id },
        include: {
          user: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
          services: {
            where: { isActive: true },
            include: { category: true },
          },
          earnings: true,
        },
      });

      if (!organizer) {
        return NextResponse.json({ error: 'Organizer not found' }, { status: 404 });
      }

      const formatted = {
        ...organizer,
        services: organizer.services.map((s) => ({
          ...s,
          images: JSON.parse(s.images as string || '[]'),
        })),
      };

      return NextResponse.json(formatted);
    }

    const organizers = await db.organizerProfile.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        services: { where: { isActive: true }, select: { id: true, title: true, price: true, priceType: true, rating: true } },
      },
      orderBy: { rating: 'desc' },
    });

    return NextResponse.json(organizers);
  } catch (error) {
    console.error('Organizers fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch organizers' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;

    const organizer = await db.organizerProfile.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
        services: { include: { category: true } },
      },
    });

    const formatted = {
      ...organizer,
      services: organizer.services.map((s) => ({
        ...s,
        images: JSON.parse(s.images as string || '[]'),
      })),
    };

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Organizer update error:', error);
    return NextResponse.json({ error: 'Failed to update organizer' }, { status: 500 });
  }
}
