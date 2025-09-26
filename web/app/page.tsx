"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiGet } from '../lib/api';

type Order = {
  id: string;
  title: string;
  description: string;
  status: 'NEW' | 'ACCEPTED' | 'DONE' | 'CANCELLED';
  createdAt: string;
};

export default function Home() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<Order[]>('/orders')
      .then(setOrders)
      .catch((error) => {
        console.error('Failed to load orders:', error);
        setOrders([]);
      })
      .finally(() => setLoading(false));
  }, []);
  if (loading) {
    return (
      <div className="container">
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
          <h1 className="heading">Список заказов</h1>
          <Link href="/new" className="btn">Создать заказ</Link>
        </div>
        <div className="muted">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
        <h1 className="heading">Список заказов</h1>
        <Link href="/new" className="btn">Создать заказ</Link>
      </div>
      <div className="list">
        {orders.length === 0 ? (
          <div className="muted">Нет заказов</div>
        ) : (
          orders.map((o) => (
            <div className="card" key={o.id}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{o.title}</div>
                  <div className="muted">{new Date(o.createdAt).toLocaleString()} • {o.status}</div>
                </div>
                <Link href={`/orders/${o.id}`} className="btn secondary">Открыть</Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
