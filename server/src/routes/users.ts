import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';

export const usersRouter = Router();

const FcmBody = z.object({ token: z.string().min(10) });

// Register/update FCM token for a user
usersRouter.post('/:id/fcm', async (req: Request, res: Response) => {
  const userId = String(req.params.id);
  const parse = FcmBody.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'invalid_body' });
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { fcmToken: parse.data.token },
      select: { id: true, fcmToken: true }
    });
    res.json(user);
  } catch {
    res.status(404).json({ error: 'user_not_found' });
  }
});


