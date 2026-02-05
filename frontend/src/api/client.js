const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }
  const res = await fetch(url, config);
  let data = {};
  try {
    const text = await res.text();
    if (text) data = JSON.parse(text);
  } catch {}
  if (!res.ok) {
    const err = new Error(data.message || data.messages?.[0] || data.error || 'Request failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  if (res.status === 204) return null;
  return data;
}

export const api = {
  employees: {
    list: () => request('/employees'),
    create: (body) => request('/employees', { method: 'POST', body }),
    delete: (id) => request(`/employees/${id}`, { method: 'DELETE' }),
  },
  attendance: {
    list: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/attendance${q ? `?${q}` : ''}`);
    },
    byEmployee: (employeeId, date) => {
      const q = date ? `?date=${date}` : '';
      return request(`/attendance/employee/${employeeId}${q}`);
    },
    stats: (employeeId) => request(`/attendance/stats/${employeeId}`),
    mark: (body) => request('/attendance', { method: 'POST', body }),
  },
};
