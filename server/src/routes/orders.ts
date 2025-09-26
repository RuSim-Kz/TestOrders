import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';

export const ordersRouter = Router();

const CreateOrderInput = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(4000),
  creatorId: z.string().min(1)
});

ordersRouter.post('/', async (req: Request, res: Response) => {
  const parse = CreateOrderInput.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'invalid_body' });
  const { title, description, creatorId } = parse.data;
  try {
    const order = await prisma.order.create({
      data: { title, description, creatorId }
    });
    res.status(201).json(order);
  } catch (e) {
    res.status(500).json({ error: 'create_failed' });
  }
});

// Сообщения по заказу
ordersRouter.get('/:id/messages', async (req: Request, res: Response) => {
  const orderId = String(req.params.id);
  try {
    const messages = await prisma.message.findMany({
      where: { orderId },
      orderBy: { createdAt: 'asc' }
    });
    res.json(messages);
  } catch {
    res.status(500).json({ error: 'messages_list_failed' });
  }
});

ordersRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch {
    res.status(500).json({ error: 'list_failed' });
  }
});

const AcceptInput = z.object({
  orderId: z.string().min(1),
  executorId: z.string().min(1)
});

ordersRouter.post('/accept', async (req: Request, res: Response) => {
  const parse = AcceptInput.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'invalid_body' });
  const { orderId, executorId } = parse.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // заказ существует и доступен
      const order = await tx.order.findUnique({
        where: { id: orderId },
        select: { id: true, executorId: true, status: true }
      });
      if (!order) {
        throw new Error('not_found');
      }
      if (order.status !== 'NEW' || order.executorId) {
        throw new Error('not_available');
      }

      //исполнитель существует
      const executor = await tx.user.findUnique({ where: { id: executorId }, select: { id: true } });
      if (!executor) {
        throw new Error('executor_not_found');
      }

      const updated = await tx.order.update({
        where: { id: orderId },
        data: { executorId, status: 'ACCEPTED' }
      });
      return updated;
    });
    res.json(result);
  } catch (e) {
    const message = (e as Error)?.message || '';
    if (message === 'not_found') {
      return res.status(404).json({ error: 'order_not_found' });
    }
    if (message === 'executor_not_found') {
      return res.status(400).json({ error: 'executor_not_found' });
    }
    if (message === 'not_available') {
      return res.status(409).json({ error: 'order_not_available' });
    }
    return res.status(500).json({ error: 'accept_failed' });
  }
});


