export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...(init || {}),
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
      cache: 'no-store'
    });
    if (!res.ok) {
      console.error(`API Error: GET ${path}`, res.status, res.statusText);
      throw new Error(`GET ${path} failed: ${res.status} ${res.statusText}`);
    }
    return res.json();
  } catch (error) {
    console.error(`Network Error: GET ${path}`, error);
    throw error;
  }
}

export async function apiPost<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) }
    });
    if (!res.ok) {
      console.error(`API Error: POST ${path}`, res.status, res.statusText);
      throw new Error(`POST ${path} failed: ${res.status} ${res.statusText}`);
    }
    return res.json();
  } catch (error) {
    console.error(`Network Error: POST ${path}`, error);
    throw error;
  }
}


