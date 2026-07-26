export type ApiUser = {
  id: string;
  username: string;
};

export type ApiEvent = {
  id: string;
  dayOfWeek: number;
  name: string;
  type: string;
  time: string; // "HH:MM" 24h
  timeMinutes: number;
};

type ApiErrorShape = { error?: string };

async function requestJson<T>(
  path: string,
  options: {
    method: "GET" | "POST" | "PATCH" | "DELETE";
    token?: string | null;
    body?: unknown;
  },
): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.token) headers.Authorization = `Bearer ${options.token}`;
  if (options.body != null) headers["Content-Type"] = "application/json";

  const res = await fetch(path, {
    method: options.method,
    headers,
    body: options.body != null ? JSON.stringify(options.body) : undefined,
  });

  const text = await res.text();
  const parsed: unknown = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const err = parsed as ApiErrorShape | null;
    throw new Error(err?.error || `Request failed (${res.status})`);
  }

  return parsed as T;
}

export async function apiSignup(params: { username: string; password: string }) {
  return requestJson<{ token: string; user: ApiUser }>("/api/auth/signup", {
    method: "POST",
    body: params,
  });
}

export async function apiLogin(params: { username: string; password: string }) {
  return requestJson<{ token: string; user: ApiUser }>("/api/auth/login", {
    method: "POST",
    body: params,
  });
}

export async function apiMe(token: string) {
  return requestJson<ApiUser>("/api/auth/me", {
    method: "GET",
    token,
  });
}

export async function apiGetEvents(token: string) {
  return requestJson<ApiEvent[]>("/api/events", {
    method: "GET",
    token,
  });
}

export async function apiCreateEvent(
  token: string,
  params: { dayOfWeek: number; name: string; time: string; type: string },
) {
  return requestJson<ApiEvent>("/api/events", {
    method: "POST",
    token,
    body: params,
  });
}

export async function apiUpdateEvent(
  token: string,
  params: {
    id: string;
    patch: Partial<{ dayOfWeek: number; name: string; time: string; type: string }>;
  },
) {
  return requestJson<{ ok: true }>(`/api/events/${params.id}`, {
    method: "PATCH",
    token,
    body: params.patch,
  });
}

export async function apiDeleteEvent(token: string, id: string) {
  return requestJson<{ ok: true }>(`/api/events/${id}`, {
    method: "DELETE",
    token,
  });
}

export async function apiResetEvents(token: string, dayOfWeek?: number) {
  const suffix =
    typeof dayOfWeek === "number" ? `?dayOfWeek=${encodeURIComponent(String(dayOfWeek))}` : "";
  return requestJson<{ ok: true }>(`/api/events${suffix}`, {
    method: "DELETE",
    token,
  });
}

