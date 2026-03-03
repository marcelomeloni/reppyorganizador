const API_URL = process.env.NEXT_PUBLIC_API_URL

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(path: string, token: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })

  const json = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new ApiError(res.status, json.error ?? `Erro ${res.status}`)
  }

  return json as T
}

export const api = {
  get: <T>(path: string, token: string) =>
    request<T>(path, token, { method: 'GET' }),

  post: <T>(path: string, token: string, body: unknown) =>
    request<T>(path, token, { method: 'POST', body: JSON.stringify(body) }),

  patch: <T>(path: string, token: string, body: unknown) =>
    request<T>(path, token, { method: 'PATCH', body: JSON.stringify(body) }),

  delete: <T>(path: string, token: string, body?: unknown) =>
    request<T>(path, token, {
      method: 'DELETE',
      ...(body ? { body: JSON.stringify(body) } : {}),
    }),
}