const API_BASE =
  import.meta.env.VITE_API_URL || 'https://ticketmanaging-backend.onrender.com/api';

const getHeaders = (isJson = true) => {
  const token = localStorage.getItem('campus_token');
  const headers = {};
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res) => {
  let data = {};
  try {
    data = await res.json();
  } catch (e) {
    data = {};
  }

  if (res.status === 401) {
    localStorage.removeItem('campus_token');
  }

  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }

  return data;
};

export const api = {
  getBaseUrl() {
    return API_BASE;
  },

  async get(url, params = {}) {
    const query = new URLSearchParams(params).toString();
    const fullUrl = query ? `${API_BASE}${url}?${query}` : `${API_BASE}${url}`;
    const res = await fetch(fullUrl, {
      method: 'GET',
      headers: getHeaders(),
    });
    return await handleResponse(res);
  },

  async post(url, body = {}) {
    const res = await fetch(`${API_BASE}${url}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return await handleResponse(res);
  },

  async patch(url, body = {}) {
    const res = await fetch(`${API_BASE}${url}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return await handleResponse(res);
  },

  async put(url, body = {}) {
    const res = await fetch(`${API_BASE}${url}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return await handleResponse(res);
  },

  getExcelExportUrl() {
    return `${API_BASE}/users/export-excel`;
  },
};
