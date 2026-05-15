import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const organizerId = searchParams.get('organizerId');

    if (!organizerId) {
      return NextResponse.json({ error: 'Organizer ID required' }, { status: 400 });
    }

    const earnings = await db.earning.findMany({
      where: { organizerId },
      orderBy: { createdAt: 'desc' },
    });

    const totalAvailable = earnings
      .filter((e) => e.type === 'booking' && e.status === 'available')
      .reduce((sum, e) => sum + e.amount, 0);

    const totalPending = earnings
      .filter((e) => e.type === 'booking' && e.status === 'pending')
      .reduce((sum, e) => sum + e.amount, 0);

    const totalWithdrawn = earnings
      .filter((e) => e.type === 'withdrawal' && e.status === 'withdrawn')
      .reduce((sum, e) => sum + e.amount, 0);

    const totalEarned = earnings
      .filter((e) => e.type === 'booking')
      .reduce((sum, e) => sum + e.amount, 0);

    return NextResponse.json({
      earnings,
      summary: { totalAvailable, totalPending, totalWithdrawn, totalEarned },
    });
  } catch (error) {
    console.error('Earnings fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch earnings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { organizerId, amount } = body;

    // Create withdrawal request
    const earning = await db.earning.create({
      data: {
        organizerId,
        amount: parseFloat(amount),
        type: 'withdrawal',
        status: 'withdrawn',
      },
    });

    // Mark available earnings as withdrawn up to the amount
    const availableEarnings = await db.earning.findMany({
      where: { organizerId, type: 'booking', status: 'available' },
      orderBy: { createdAt: 'asc' },
    });

    let remaining = parseFloat(amount);
    for (const e of availableEarnings) {
      if (remaining <= 0) break;
      await db.earning.update({
        where: { id: e.id },
        data: { status: 'withdrawn' },
      });
      remaining -= e.amount;
    }

    return NextResponse.json(earning);
  } catch (error) {
    console.error('Withdrawal error:', error);
    return NextResponse.json({ error: 'Failed to process withdrawal' }, { status: 500 });
  }
}
