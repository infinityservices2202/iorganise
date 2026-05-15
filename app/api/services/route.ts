import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const categoryId = searchParams.get('categoryId');
    const organizerId = searchParams.get('organizerId');
    const search = searchParams.get('search');
    const city = searchParams.get('city');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minRating = searchParams.get('minRating');
    const sortBy = searchParams.get('sortBy');
    const limit = parseInt(searchParams.get('limit') || '50');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    // Single service lookup
    if (id) {
      const service = await db.service.findUnique({
        where: { id },
        include: {
          organizer: {
            include: { user: { select: { id: true, name: true, avatar: true } } },
          },
          category: true,
        },
      });

      if (!service) {
        return NextResponse.json({ error: 'Service not found' }, { status: 404 });
      }

      return NextResponse.json({ ...service, images: JSON.parse(service.images as string || '[]') });
    }

    const where: Record<string, unknown> = {};
    if (!includeInactive) where.isActive = true;

    if (categoryId) where.categoryId = categoryId;
    if (organizerId) where.organizerId = organizerId;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) (where.price as Record<string, unknown>).gte = parseFloat(minPrice);
      if (maxPrice) (where.price as Record<string, unknown>).lte = parseFloat(maxPrice);
    }
    if (minRating) where.rating = { gte: parseFloat(minRating) };

    if (city) {
      where.organizer = { city: { contains: city } };
    }

    let orderBy: Record<string, string> = { createdAt: 'desc' };
    if (sortBy === 'price_asc') orderBy = { price: 'asc' };
    else if (sortBy === 'price_desc') orderBy = { price: 'desc' };
    else if (sortBy === 'rating') orderBy = { rating: 'desc' };
    else if (sortBy === 'newest') orderBy = { createdAt: 'desc' };

    const services = await db.service.findMany({
      where,
      include: {
        organizer: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
        },
        category: true,
      },
      orderBy,
      take: limit,
    });

    const formattedServices = services.map((s) => ({
      ...s,
      images: JSON.parse(s.images as string || '[]'),
    }));

    return NextResponse.json(formattedServices);
  } catch (error) {
    console.error('Services fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { organizerId, categoryId, title, description, price, priceType, images, duration, maxGuests } = body;

    const service = await db.service.create({
      data: {
        organizerId,
        categoryId,
        title,
        description,
        price: parseFloat(price),
        priceType: priceType || 'fixed',
        images: JSON.stringify(images || []),
        duration,
        maxGuests: maxGuests ? parseInt(maxGuests) : null,
      },
      include: {
        organizer: { include: { user: true } },
        category: true,
      },
    });

    return NextResponse.json({ ...service, images: JSON.parse(service.images as string || '[]') });
  } catch (error) {
    console.error('Service create error:', error);
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;

    if (data.images) data.images = JSON.stringify(data.images);
    if (data.price) data.price = parseFloat(data.price);
    if (data.maxGuests) data.maxGuests = parseInt(data.maxGuests);

    const service = await db.service.update({
      where: { id },
      data,
      include: {
        organizer: { include: { user: true } },
        category: true,
      },
    });

    return NextResponse.json({ ...service, images: JSON.parse(service.images as string || '[]') });
  } catch (error) {
    console.error('Service update error:', error);
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Service ID required' }, { status: 400 });
    }

    await db.service.delete({ where: { id } });
    return NextResponse.json({ message: 'Service deleted' });
  } catch (error) {
    console.error('Service delete error:', error);
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
  }
}
