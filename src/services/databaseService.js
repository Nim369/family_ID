// Centralized Data Synchronization Service
// Unifies Citizen Portal (Port 3000) & Taluka Officer Portal (Port 3001)

import { INITIAL_FAMILIES } from '../data/mockDatabase';

export async function fetchLiveFamilies() {
  try {
    const res = await fetch('/api/families');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem('gj_kutumb_families', JSON.stringify(data));
        return data;
      }
    }
  } catch (err) {
    console.warn('[Sync] /api/families network fetch failed, falling back to storage:', err.message);
  }

  const cached = localStorage.getItem('gj_kutumb_families');
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {}
  }

  return INITIAL_FAMILIES;
}

export async function saveLiveFamilies(families) {
  if (!Array.isArray(families)) return;
  
  // 1. Instant local persistence for zero-latency UI
  localStorage.setItem('gj_kutumb_families', JSON.stringify(families));

  // 2. Broadcast to shared backend server on disk
  try {
    const res = await fetch('/api/families', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(families)
    });
    if (!res.ok) {
      console.warn('[Sync] Backend save returned status', res.status);
    }
  } catch (err) {
    console.warn('[Sync] Could not reach backend /api/families:', err.message);
  }
}

export async function fetchLiveNotifications() {
  try {
    const res = await fetch('/api/notifications');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        localStorage.setItem('gj_kutumb_notifications', JSON.stringify(data));
        return data;
      }
    }
  } catch (err) {
    // console.warn('[Sync] /api/notifications fetch failed');
  }

  const cached = localStorage.getItem('gj_kutumb_notifications');
  return cached ? JSON.parse(cached) : [];
}

export async function dispatchLiveNotification(notification) {
  if (!notification) return;

  const currentCached = JSON.parse(localStorage.getItem('gj_kutumb_notifications') || '[]');
  const updated = [notification, ...currentCached].slice(0, 50);
  localStorage.setItem('gj_kutumb_notifications', JSON.stringify(updated));

  try {
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notification)
    });
  } catch (err) {
    console.warn('[Sync] Could not push notification to backend:', err.message);
  }
}
