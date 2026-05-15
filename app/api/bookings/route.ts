import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');
    const organizerId = searchParams.get('organizerId');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (customerId) where.customerId = customerId;
    if (status) where.status = status;
    if (organizerId) {
      where.service = { organizerId };
    }

    const bookings = await db.booking.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
        service: {
          include: {
            organizer: {
              include: { user: { select: { id: true, name: true, avatar: true } } },
            },
            category: true,
          },
        },
        payments: true,
        review: { include: { user: { select: { id: true, name: true, avatar: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = bookings.map((b) => ({
      ...b,
      service: {
        ...b.service,
        images: JSON.parse(b.service.images as string || '[]'),
      },
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Bookings fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerId, serviceId, eventDate, eventTime, guestCount, notes, totalAmount } = body;

    const booking = await db.booking.create({
      data: {
        customerId,
        serviceId,
        eventDate: new Date(eventDate),
        eventTime,
        guestCount: guestCount ? parseInt(guestCount) : null,
        notes,
        totalAmount: parseFloat(totalAmount),
        advancePaid: 0,
        status: 'pending',
      },
      include: {
        customer: { select: { id: true, name: true, email: true, avatar: true } },
        service: { include: { organizer: { include: { user: true } }, category: true } },
      },
    });

    // Create notification for organizer
    await db.notification.create({
      data: {
        userId: booking.service.organizer.userId,
        title: 'New Booking Request',
        message: `${booking.customer.name} has requested a booking for ${booking.service.title}`,
        type: 'booking',
      },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Booking create error:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, advancePaid } = body;

    const data: Record<string, unknown> = {};
    if (status) data.status = status;
    if (advancePaid !== undefined) data.advancePaid = parseFloat(advancePaid);

    const booking = await db.booking.update({
      where: { id },
      data,
      include: {
        customer: { select: { id: true, name: true, email: true, avatar: true } },
        service: { include: { organizer: { include: { user: true } } } },
      },
    });

    // Create notification for customer if status changed
    if (status) {
      const statusMessages: Record<string, string> = {
        accepted: 'has been accepted',
        rejected: 'has been rejected',
        ongoing: 'is now ongoing',
        completed: 'has been completed',
        cancelled: 'has been cancelled',
      };

      await db.notification.create({
        data: {
          userId: booking.customerId,
          title: `Booking ${statusMessages[status] || 'Updated'}`,
          message: `Your booking for ${booking.service.title} ${statusMessages[status] || 'has been updated'}`,
          type: 'booking',
        },
      });
    }

    // If accepted, create earning
    if (status === 'accepted') {
      await db.earning.create({
        data: {
          organizerId: booking.service.organizerId,
          bookingId: booking.id,
          amount: booking.totalAmount,
          type: 'booking',
          status: 'pending',
        },
      });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Booking update error:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}
