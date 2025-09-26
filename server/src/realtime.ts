import { Server as SocketIOServer, Socket } from 'socket.io';
import { z } from 'zod';
import { prisma } from './prisma';
import { sendFcmNotification } from './fcm';

const MessageInput = z.object({
  orderId: z.string().min(1),
  senderId: z.string().min(1),
  text: z.string().min(1).max(4000)
});

export function registerRealtime(io: SocketIOServer): void {
  io.on('connection', (socket: Socket) => {
    socket.on('join', (orderId: string) => {
      if (typeof orderId === 'string' && orderId) {
        socket.join(roomForOrder(orderId));
      }
    });

    socket.on('message:send', async (payload) => {
      const parse = MessageInput.safeParse(payload);
      if (!parse.success) return;
      const { orderId, senderId, text } = parse.data;

      try {
        const message = await prisma.message.create({
          data: { orderId, senderId, text }
        });

        io.to(roomForOrder(orderId)).emit('message:new', message);

        //отправка уведомлений участникам (создателю/исполнителю) кроме отправителя
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          select: { creatorId: true, executorId: true, creator: { select: { fcmToken: true } }, executor: { select: { fcmToken: true } } }
        });
        if (order) {
          const tokens = [order.creator?.fcmToken, order.executor?.fcmToken]
            .filter((t): t is string => Boolean(t));
          const recipients = tokens;
          if (recipients.length) {
            await sendFcmNotification(recipients, {
              title: 'Новое сообщение',
              body: text.slice(0, 120),
              data: { orderId }
            });
          }
        }
      } catch (e) {
        console.error('message:send failed', e);
      }
    });
  });
}

function roomForOrder(orderId: string): string {
  return `order:${orderId}`;
}


