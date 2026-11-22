export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

type ApiResponse<T> = { success: true; data: T } | { success: false; error: { message: string; details?: unknown } };

let refreshPromise: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const res = await fetch('/api/admin/auth/refresh', { method: 'POST', credentials: 'same-origin' });
      return res.ok;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(options?.headers as Record<string, string>) };
  const res = await fetch(path, { ...options, headers, credentials: 'same-origin' });

  if (res.status === 401 && path.startsWith('/api/admin/') && !path.includes('/auth/')) {
    const refreshed = await doRefresh();
    if (refreshed) {
      const retry = await fetch(path, { ...options, headers, credentials: 'same-origin' });
      return handleResponse<T>(retry, path);
    }
    if (typeof window !== 'undefined') {
      const next = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/admin/login?next=${next}`;
    }
    throw new ApiError('Your session ended. Please sign in again.', 401);
  }

  return handleResponse<T>(res, path);
}

async function handleResponse<T>(res: Response, path: string): Promise<T> {
  let body: ApiResponse<T> | null = null;
  try { body = await res.json(); } catch { body = null; }

  if (!res.ok || !body || !body.success) {
    const message = body && !body.success ? body.error.message : `Request failed (${res.status})`;
    const details = body && !body.success ? body.error.details : undefined;
    throw new ApiError(message, res.status, details);
  }
  return body.data;
}

export async function apiUpload(path: string, formData: FormData): Promise<any> {
  const res = await fetch(path, { method: 'POST', body: formData, credentials: 'same-origin' });

  if (res.status === 401 && path.startsWith('/api/admin/')) {
    const refreshed = await doRefresh();
    if (refreshed) {
      const retry = await fetch(path, { method: 'POST', body: formData, credentials: 'same-origin' });
      return handleResponse<any>(retry, path);
    }
    if (typeof window !== 'undefined') {
      const next = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/admin/login?next=${next}`;
    }
    throw new ApiError('Your session ended. Please sign in again.', 401);
  }

  return handleResponse<any>(res, path);
}
