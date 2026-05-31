// BASE_URL is "/surgical/" in prod, "/" in dev → "/surgical/api" or "/api"
const BASE = `${import.meta.env.BASE_URL}api`;

function getToken() {
  return localStorage.getItem("token");
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = `${import.meta.env.BASE_URL}login`;
    return;
  }

  let data = null;
  if (res.status !== 204) {
    const text = await res.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        if (!res.ok) throw new Error(`Server error (${res.status})`);
      }
    }
  }

  if (!res.ok) {
    throw new Error(data?.detail || "Request failed");
  }
  return data;
}

export const api = {
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  getStores: () => request("/stores"),

  getItems: (store) =>
    request(store ? `/items?store=${encodeURIComponent(store)}` : "/items"),
  createItem: (data) =>
    request("/items", { method: "POST", body: JSON.stringify(data) }),
  updateItem: (id, data) =>
    request(`/items/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteItem: (id) =>
    request(`/items/${id}`, { method: "DELETE" }),

  createTransaction: (data) =>
    request("/transactions", { method: "POST", body: JSON.stringify(data) }),
  getTransactions: (itemId) =>
    request(itemId ? `/transactions?item_id=${itemId}` : "/transactions"),

  getUsers: () => request("/users"),
  createUser: (data) =>
    request("/users", { method: "POST", body: JSON.stringify(data) }),
  deleteUser: (id) =>
    request(`/users/${id}`, { method: "DELETE" }),
};
