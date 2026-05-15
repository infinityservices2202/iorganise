import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId1 = searchParams.get('userId1');
    const userId2 = searchParams.get('userId2');
    const organizerId = searchParams.get('organizerId');

    if (!userId1 || !userId2 || !organizerId) {
      return NextResponse.json([]);
    }

    const messages = await db.chatMessage.findMany({
      where: {
        organizerId,
        senderId: { in: [userId1, userId2] },
        receiverId: { in: [userId1, userId2] },
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true, role: true } },
        receiver: { select: { id: true, name: true, avatar: true, role: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: 200,
    });

    // Mark unread messages as read (non-blocking)
    db.chatMessage.updateMany({
      where: {
        organizerId,
        receiverId: userId1,
        senderId: userId2,
        isRead: false,
      },
      data: { isRead: true },
    }).catch(() => {});

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Chat fetch error:', error);
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { senderId, receiverId, organizerId, message } = body;

    if (!senderId || !receiverId || !organizerId || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const chatMessage = await db.chatMessage.create({
      data: {
        senderId,
        receiverId,
        organizerId,
        message,
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true, role: true } },
        receiver: { select: { id: true, name: true, avatar: true, role: true } },
      },
    });

    // Notification is non-critical - don't block on it
    db.notification.create({
      data: {
        userId: receiverId,
        title: 'New Message',
        message: `${chatMessage.sender.name}: ${message.slice(0, 50)}${message.length > 50 ? '...' : ''}`,
        type: 'info',
      },
    }).catch(() => {});

    return NextResponse.json(chatMessage);
  } catch (error) {
    console.error('Chat send error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
