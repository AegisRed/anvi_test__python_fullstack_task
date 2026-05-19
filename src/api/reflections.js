const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

async function parseResponse(response) {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message ?? 'Request failed.');
  }

  return payload;
}

export async function fetchReflections() {
  const response = await fetch(`${API_BASE_URL}/api/reflections`);
  return parseResponse(response);
}

export async function submitReflection(text) {
  const response = await fetch(`${API_BASE_URL}/api/reflections`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  return parseResponse(response);
}

export async function updateReflection(id, text) {
  const response = await fetch(`${API_BASE_URL}/api/reflections/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  return parseResponse(response);
}

export async function deleteReflection(id) {
  const response = await fetch(`${API_BASE_URL}/api/reflections/${id}`, {
    method: 'DELETE',
  });

  return parseResponse(response);
}

export async function loadDemoReflections() {
  const response = await fetch(`${API_BASE_URL}/api/reflections/demo`, {
    method: 'POST',
  });

  return parseResponse(response);
}
