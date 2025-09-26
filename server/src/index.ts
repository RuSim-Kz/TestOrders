import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';
import { registerRealtime } from './realtime';
import { ordersRouter } from './routes/orders';
import { usersRouter } from './routes/users';

dotenv.config();

const app = express();
app.use(cors({ origin: '*'}));
app.use(express.json());
app.use(express.static('public'));

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.use('/orders', ordersRouter);
app.use('/users', usersRouter);

const port = Number(process.env.PORT || 4000);
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: { origin: '*'}
});

registerRealtime(io);

server.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});


