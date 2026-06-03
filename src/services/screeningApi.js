// ── Backend API Service for Screening Module ──
// Connects to the local Node.js screening backend on port 5001

const SCREENING_API_URL = '/api/screening';

function cleanUrl(base) {
  return base.replace(/\/+$/, '');
}

/**
 * Submit candidate screening evaluation answers to the backend.
 * Payload sent to backend: { name: string, email: string, answers: { q1: "...", q2: "..." } }
 */
export async function submitScreeningAnswers(name, email, answers) {
  const payload = { name, email, answers };

  const res = await fetch(`${cleanUrl(SCREENING_API_URL)}/api/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to submit screening answers (HTTP ${res.status}): ${text}`);
  }
  return await res.json();
}
