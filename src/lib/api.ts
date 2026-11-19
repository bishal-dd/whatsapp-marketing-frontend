export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Calls the backend with the login cookie. Throws ApiError with the backend's message. */
export async function api<T>(method: string, path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      credentials: "include",
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError("Can't reach the server. Check your connection.", 0);
  }
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(json?.message ?? `Something went wrong (${res.status})`, res.status);
  return json as T;
}

export type Data<T> = { success: boolean; data: T; message?: string };
export type Paged<T> = { success: boolean; data: T[]; pagination: { page: number; limit: number; total: number; totalPages: number } };
