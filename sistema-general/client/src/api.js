const BASE = '/api';

function getToken() { return localStorage.getItem('sg_token'); }

async function req(method, path, body) {
  const token = getToken();
  const res = await fetch(BASE + path, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) {
    localStorage.removeItem('sg_token');
    window.location.reload();
    return;
  }
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  return res.json();
}

export const api = {
  login:      (data) => req('POST', '/login', data),
  me:         () => req('GET', '/me'),
  getSheets:  () => req('GET', '/sheets'),
  getTabs:    (id) => req('GET', `/sheets/${id}/tabs`),
  getData:    (id, tab) => req('GET', `/sheets/${id}/data?tab=${encodeURIComponent(tab)}`),
  addRow:     (id, tab, values) => req('POST', `/sheets/${id}/data`, { tab, values }),
  updateRow:  (id, tab, row, values) => req('PUT', `/sheets/${id}/data/${row}`, { tab, values }),
  deleteRow:  (id, tab, row) => req('DELETE', `/sheets/${id}/data/${row}?tab=${encodeURIComponent(tab)}`),
};
