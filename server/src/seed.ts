import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.upsert({
    where: { email: 'demo1@example.com' },
    update: {},
    create: {
      email: 'demo1@example.com',
      passwordHash,
      displayName: 'Demo One'
    }
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'demo2@example.com' },
    update: {},
    create: {
      email: 'demo2@example.com',
      passwordHash,
      displayName: 'Demo Two'
    }
  });

  let order = await prisma.order.findFirst({
    where: { title: 'Первый заказ', creatorId: user1.id }
  });
  if (!order) {
    order = await prisma.order.create({
      data: {
        title: 'Первый заказ',
        description: 'Тестовый заказ для проверки API и чата',
        creatorId: user1.id
      }
    });
  }

  //стартовое сообщение
  await prisma.message.create({
    data: { orderId: order.id, senderId: user1.id, text: 'Добро пожаловать в чат заказа!' }
  }).catch(() => undefined);

  console.log(JSON.stringify({
    users: [
      { id: user1.id, email: user1.email, displayName: user1.displayName },
      { id: user2.id, email: user2.email, displayName: user2.displayName }
    ],
    order: { id: order.id, title: order.title }
  }, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


