/**
 * AquaTriage API Client with 10s timeout and automatic local fallback
 */

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

async function fetchWithTimeout(resource, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function getSurveys() {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/api/surveys`, {}, 4000);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { data, isFallback: false };
  } catch (err) {
    console.warn('Using fallback surveys list:', err);
    return {
      data: [
        { id: 'survey1', name: 'Survey 1', frames: 8 },
        { id: 'survey2', name: 'Survey 2', frames: 8 },
        { id: 'survey3', name: 'Survey 3', frames: 6 },
      ],
      isFallback: true,
    };
  }
}

export async function runSurvey(surveyId, conf = 0.4, correct = true) {
  try {
    const res = await fetchWithTimeout(
      `${BASE_URL}/api/survey/${surveyId}?conf=${conf}&correct=${correct}`,
      { method: 'POST' },
      10000
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { data, isFallback: false };
  } catch (err) {
    console.warn(`Survey ${surveyId} failed, loading fallback:`, err);
    try {
      const fallbackRes = await fetch(`/fallback/${surveyId}.json`);
      if (!fallbackRes.ok) throw new Error(`Fallback HTTP ${fallbackRes.status}`);
      const data = await fallbackRes.json();
      return { data, isFallback: true };
    } catch (fallbackErr) {
      throw new Error(`Failed to load survey data: ${err.message}`);
    }
  }
}

export async function detectSingleImage(file, conf = 0.4, correct = true) {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('conf', conf.toString());
  formData.append('correct', correct.toString());

  const res = await fetchWithTimeout(
    `${BASE_URL}/api/detect`,
    {
      method: 'POST',
      body: formData,
    },
    15000
  );
  if (!res.ok) throw new Error(`Detect failed with HTTP ${res.status}`);
  const data = await res.json();
  return { data, isFallback: false };
}

export async function computeRoute(start, pins, surveyId = null) {
  try {
    const res = await fetchWithTimeout(
      `${BASE_URL}/api/route`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start, pins }),
      },
      8000
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { data, isFallback: false };
  } catch (err) {
    console.warn('Route computation failed, checking fallback route:', err);
    if (surveyId) {
      try {
        const fallbackRes = await fetch(`/fallback/${surveyId}_route.json`);
        if (fallbackRes.ok) {
          const data = await fallbackRes.json();
          return { data, isFallback: true };
        }
      } catch (e) {
        // continue to client-side fallback
      }
    }
    // Simple client-side fallback route
    return { data: buildLocalRoute(start, pins), isFallback: true };
  }
}

function buildLocalRoute(start, pins) {
  if (!pins || pins.length === 0) {
    return {
      order: [],
      path: [start],
      naive_path: [start],
      naive_length_m: 3030.6,
      optimized_length_m: 0,
      saved_pct: 0,
      algorithm: 'offline-fallback',
    };
  }
  // Nearest neighbour
  const remaining = [...pins];
  const order = [];
  const path = [start];
  let curr = start;
  let distPx = 0;

  while (remaining.length > 0) {
    let bestIdx = 0;
    let bestD = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const p = remaining[i];
      const d = Math.hypot(p.x - curr.x, p.y - curr.y);
      if (d < bestD) {
        bestD = d;
        bestIdx = i;
      }
    }
    const nextPin = remaining.splice(bestIdx, 1)[0];
    order.push(nextPin.id);
    path.push({ x: nextPin.x, y: nextPin.y });
    distPx += bestD;
    curr = nextPin;
  }

  const optimized_m = Math.round(distPx * 0.5 * 10) / 10;
  const naive_m = 3030.6;
  const saved_pct = Math.round(((naive_m - optimized_m) / naive_m) * 1000) / 10;

  return {
    order,
    path,
    naive_path: [
      { x: 80, y: 70 }, { x: 620, y: 70 },
      { x: 620, y: 130 }, { x: 80, y: 130 },
      { x: 80, y: 190 }, { x: 620, y: 190 },
      { x: 620, y: 250 }, { x: 80, y: 250 },
      { x: 80, y: 310 }, { x: 620, y: 310 },
      { x: 620, y: 370 }, { x: 80, y: 370 }
    ],
    naive_length_m: naive_m,
    optimized_length_m: optimized_m,
    saved_pct: Math.max(0, saved_pct),
    algorithm: 'nearest-neighbour (offline)',
  };
}
