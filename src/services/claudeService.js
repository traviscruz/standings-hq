import { API_URL as API_BASE } from '../config';

export async function generateSportConfig(description, eventDetails = {}) {
  const res = await fetch(`${API_BASE}/sports/generate-config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description, eventDetails })
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to generate sport configuration');
  }

  return data.config;
}
