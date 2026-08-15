// DentalShark backend connection — the ONLY file you should need to edit
// when the backend's URL changes (e.g. moving hosts, or going from local
// dev to production).
//
// Include this file BEFORE any other script that calls the API:
//   <script src="js/api-config.js"></script>
//   <script src="js/your-other-script.js"></script>

const API_BASE_URL = "https://dentalshark-backend.vercel.app"; // ← replace with your real deployed backend URL
// For local development against a backend running on your own machine:
// const API_BASE_URL = "http://localhost:5000";

/**
 * Small fetch wrapper — every API call in your HTML/JS files should go
 * through this instead of calling fetch() directly, so the base URL only
 * ever needs to change in one place.
 *
 * Usage examples:
 *   const products = await dentalSharkApi('/api/products');
 *   const result = await dentalSharkApi('/api/auth/login', {
 *     method: 'POST',
 *     body: { email, password }
 *   });
 */
async function dentalSharkApi(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error((data && data.error) || `Request failed (${res.status})`);
  }
  return data;
}
