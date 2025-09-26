"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { API_URL, apiGet, apiPost } from '../../../lib/api';
import { enableFcm } from '../../../lib/fcm';
import { io, Socket } from 'socket.io-client';

type Message = { id: string; orderId: string; senderId: string; text: string; createdAt: string };

export default function OrderPage() {
  const params = useParams<{ id: string }>();
  const orderId = params.id as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [senderId, setSenderId] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const s: Socket | null = io(API_URL, { transports: ['websocket'] });
    s.emit('join', orderId);
    s.on('message:new', (msg: Message) => setMessages((m) => [...m, msg]));
    setSocket(s);
    return () => { s?.disconnect(); };
  }, [orderId]);

  useEffect(() => {
    apiGet<Message[]>(`/orders/${orderId}/messages`).then(setMessages).catch(() => {});
  }, [orderId]);

  // persist senderId for convenience
  useEffect(() => {
    const stored = localStorage.getItem('senderId');
    if (stored) setSenderId(stored);
  }, []);
  useEffect(() => {
    if (senderId) localStorage.setItem('senderId', senderId);
  }, [senderId]);

  const send = () => {
    if (!socket) return alert('Нет соединения с сокетом');
    if (!senderId) return alert('Введите ваш senderId (из сид-скрипта)');
    if (!text) return;
    socket.emit('message:send', { orderId, senderId, text });
    setText("");
  };

  const accept = async () => {
    if (!senderId) return alert('Введите ваш senderId');
    await apiPost('/orders/accept', { orderId, executorId: senderId });
    alert('Заказ принят');
  };

  return (
    <div className="container" style={{ maxWidth: 800 }}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
        <h1 className="heading">Заказ {orderId}</h1>
        <div className="row">
          <input className="input" placeholder="Ваш senderId (например, из сидов)" value={senderId} onChange={(e) => setSenderId(e.target.value)} style={{ minWidth: 320 }} />
          <button className="btn secondary" onClick={accept} disabled={!senderId}>Принять заказ</button>
          <button className="btn" onClick={() => senderId ? enableFcm(senderId) : alert('Сначала введите senderId')}>Включить уведомления</button>
        </div>
      </div>
      <div className="muted" style={{ marginTop: -8, marginBottom: 8 }}>Подсказка: возьмите один из id из вывода npm run seed.</div>
      <div className="card" style={{ height: 360, overflow: 'auto', marginBottom: 12 }}>
        {messages.map(m => (
          <div key={m.id} className="message">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div className="mono">{m.senderId}</div>
              <div className="muted">{new Date(m.createdAt).toLocaleTimeString()}</div>
            </div>
            <div style={{ marginTop: 4 }}>{m.text}</div>
          </div>
        ))}
      </div>
      <div className="row">
        <input className="input" placeholder="Сообщение" value={text} onChange={(e) => setText(e.target.value)} />
        <button className="btn" onClick={send} disabled={!text || !senderId}>Отправить</button>
      </div>
    </div>
  );
}


