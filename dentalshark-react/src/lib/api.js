const API_URL = import.meta.env.VITE_API_URL || '';

const TOKEN_KEY = 'ds_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request(path, { method = 'GET', body, auth = true, headers = {}, isForm = false } = {}) {
  const finalHeaders = { ...headers };
  if (!isForm) finalHeaders['Content-Type'] = 'application/json';

  if (auth) {
    const token = getToken();
    if (token) finalHeaders['Authorization'] = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: finalHeaders,
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    });
  } catch (networkErr) {
    throw new ApiError('Could not reach the server. Check your connection and try again.', 0, null);
  }

  let data = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await res.json().catch(() => null);
  }

  if (!res.ok) {
    throw new ApiError(data?.error || `Request failed (${res.status})`, res.status, data);
  }

  return data;
}

export const api = {
  // ---- Auth ----
  login: (payload) => request('/api/auth/login', { method: 'POST', body: payload, auth: false }),
  register: (payload) => request('/api/auth/register', { method: 'POST', body: payload, auth: false }),
  me: () => request('/api/auth/me'),

  // ---- Catalog ----
  getProducts: () => request('/api/products', { auth: false }),
  getUsers: () => request('/api/users', { auth: false }),

  // ---- Admin: Products ----
  createProduct: (payload) => request('/api/products', { method: 'POST', body: payload }),
  updateProduct: (id, payload) => request(`/api/products/${id}`, { method: 'PUT', body: payload }),
  deleteProduct: (id) => request(`/api/products/${id}`, { method: 'DELETE' }),

  // ---- Orders ----
  getOrders: () => request('/api/orders'),
  createOrder: (payload) => request('/api/orders', { method: 'POST', body: payload }),
  checkout: (payload) => request('/api/orders/checkout', { method: 'POST', body: payload }), // FACADE
  reorder: (orderId) => request(`/api/orders/${orderId}/reorder`), // PROTOTYPE
  updateOrder: (id, payload) => request(`/api/orders/${id}`, { method: 'PUT', body: payload }),
  deleteOrder: (id) => request(`/api/orders/${id}`, { method: 'DELETE' }),
  trackOrder: (trackingId) => request(`/api/orders/track/${encodeURIComponent(trackingId)}`, { auth: false }),

  // ---- Social ----
  react: (productId, type) => request('/api/social/react', { method: 'POST', body: { productId, type } }),
  comment: (productId, text) => request('/api/social/comment', { method: 'POST', body: { productId, text } }),
  deleteComment: (productId, commentId) =>
    request(`/api/social/comment/${productId}/${commentId}`, { method: 'DELETE' }),

  // ---- Admin: Users ----
  createUser: (payload) => request('/api/users', { method: 'POST', body: payload }),
  updateUser: (id, payload) => request(`/api/users/${id}`, { method: 'PUT', body: payload }),
  deleteUser: (id) => request(`/api/users/${id}`, { method: 'DELETE' }),

  // ---- Admin: Suppliers ----
  getSuppliers: () => request('/api/suppliers', { auth: false }),
  createSupplier: (payload) => request('/api/suppliers', { method: 'POST', body: payload }),
  updateSupplier: (id, payload) => request(`/api/suppliers/${id}`, { method: 'PUT', body: payload }),
  deleteSupplier: (id) => request(`/api/suppliers/${id}`, { method: 'DELETE' }),

  // ---- AI ----
  analyze: (formData) => request('/api/analyze', { method: 'POST', body: formData, isForm: true, auth: false }),

  // ---- Misc ----
  bookService: (payload) => request('/api/service-bookings', { method: 'POST', body: payload }).catch(() => {
    // Backend route is optional; degrade gracefully if not present.
    return { success: true, offline: true };
  }),
  getBookings: () => request('/api/service-bookings').catch(() => []),
  updateBooking: (id, payload) => request(`/api/service-bookings/${id}`, { method: 'PUT', body: payload }),
  deleteBooking: (id) => request(`/api/service-bookings/${id}`, { method: 'DELETE' }),
};

export { ApiError };
