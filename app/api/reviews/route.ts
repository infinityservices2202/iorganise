import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bookingId, userId, rating, comment, images } = body;

    const review = await db.review.create({
      data: {
        bookingId,
        userId,
        rating: parseInt(rating),
        comment,
        images: JSON.stringify(images || []),
      },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });

    // Update service rating
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      select: { serviceId: true },
    });

    if (booking) {
      const reviews = await db.review.findMany({
        where: { booking: { serviceId: booking.serviceId } },
      });
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await db.service.update({
        where: { id: booking.serviceId },
        data: { rating: Math.round(avgRating * 10) / 10, reviewCount: reviews.length },
      });
    }

    return NextResponse.json({ ...review, images: JSON.parse(review.images as string || '[]') });
  } catch (error) {
    console.error('Review create error:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
