import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bookingId, customerId, amount, method, status } = body;

    const payment = await db.payment.create({
      data: {
        bookingId,
        customerId,
        amount: parseFloat(amount),
        method: method || 'upi',
        status: status || 'completed',
        transactionId: `TXN${Date.now()}${Math.random().toString(36).slice(2, 8)}`,
      },
    });

    // Create notification for customer
    await db.notification.create({
      data: {
        userId: customerId,
        title: 'Payment Successful',
        message: `Payment of ₹${parseFloat(amount).toLocaleString('en-IN')} has been processed successfully`,
        type: 'payment',
      },
    });

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Payment create error:', error);
    return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');
    const bookingId = searchParams.get('bookingId');

    const where: Record<string, unknown> = {};
    if (customerId) where.customerId = customerId;
    if (bookingId) where.bookingId = bookingId;

    const payments = await db.payment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Payments fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}
