// ── Backend API Service for Aptitude Test Module ──
// Connects to the AptitudeIQ backend via ngrok

const APTITUDE_API_URL = 'https://julius-nondivisional-laureen.ngrok-free.dev';

// Ngrok requires this header to bypass the browser warning page
const NGROK_HEADERS = { 'ngrok-skip-browser-warning': 'true' };

function cleanUrl(base) {
  return base.replace(/\/+$/, '');
}

/**
 * Fetch 15 randomized aptitude questions.
 * Returns: [{ id, category, question, options: { A, B, C, D }, source }, ...]
 */
export async function fetchQuestions() {
  const res = await fetch(`${cleanUrl(APTITUDE_API_URL)}/api/questions`, {
    method: 'GET',
    headers: { ...NGROK_HEADERS },
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`Failed to fetch questions (HTTP ${res.status}): ${text}`);
  return JSON.parse(text);
}

/**
 * Submit user answers to the backend.
 * Payload: { answers: [{ question_id, answer }, ...], email: 'user@example.com' }
 * Returns: { score, correct, wrong, skipped, percentage }
 */
export async function submitAnswers(answers, email = null) {
  const payload = { answers };
  if (email) payload.email = email;

  const res = await fetch(`${cleanUrl(APTITUDE_API_URL)}/api/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...NGROK_HEADERS },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`Failed to submit answers (HTTP ${res.status}): ${text}`);
  return JSON.parse(text);
}

/**
 * Fetch all past test results.
 * Returns: [{ id, score, correct, wrong, skipped, percentage, submitted_at }, ...]
 */
export async function fetchResults() {
  const res = await fetch(`${cleanUrl(APTITUDE_API_URL)}/api/results`, {
    method: 'GET',
    headers: { ...NGROK_HEADERS },
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`Failed to fetch results (HTTP ${res.status}): ${text}`);
  return JSON.parse(text);
}
