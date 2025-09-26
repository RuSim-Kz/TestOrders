"use client";
import { useState } from 'react';
import { apiPost } from '../../lib/api';
import { useRouter } from 'next/navigation';

export default function NewOrderPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creatorId, setCreatorId] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const order = await apiPost("/orders", { title, description, creatorId });
      router.push(`/orders/${order.id}`);
    } catch (e) {
      alert("Ошибка создания заказа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 720 }}>
      <h1 className="heading">Создать заказ</h1>
      <form onSubmit={onSubmit} className="list">
        <input className="input" placeholder="Название" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea className="textarea" placeholder="Описание" value={description} onChange={(e) => setDescription(e.target.value)} required />
        <input className="input" placeholder="Creator ID (из сидов)" value={creatorId} onChange={(e) => setCreatorId(e.target.value)} required />
        <div className="row">
          <button className="btn" type="submit" disabled={loading}>{loading ? 'Создание...' : 'Создать'}</button>
        </div>
      </form>
    </div>
  );
}


