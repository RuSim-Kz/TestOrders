import Link from 'next/link';
import { apiGet } from '../lib/api';

type Order = {
  id: string;
  title: string;
  description: string;
  status: 'NEW' | 'ACCEPTED' | 'DONE' | 'CANCELLED';
  createdAt: string;
};

export default async function Home() {
  const orders = await apiGet<Order[]>('/orders');
  return (
    <div className="container">
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
        <h1 className="heading">Список заказов</h1>
        <Link href="/new" className="btn">Создать заказ</Link>
      </div>
      <div className="list">
        {orders.map((o) => (
          <div className="card" key={o.id}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{o.title}</div>
                <div className="muted">{new Date(o.createdAt).toLocaleString()} • {o.status}</div>
              </div>
              <Link href={`/orders/${o.id}`} className="btn secondary">Открыть</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
