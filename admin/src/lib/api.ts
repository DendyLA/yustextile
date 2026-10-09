import type { ContentItem, Order, PagedResult, Subscriber } from "./types";

const tokenKey = "yus_admin_token";

export function getToken(): string {
  return typeof window === "undefined"
    ? ""
    : sessionStorage.getItem(tokenKey) || "";
}

export function setToken(token: string): void {
  sessionStorage.setItem(tokenKey, token);
}

export function clearToken(): void {
  sessionStorage.removeItem(tokenKey);
}

export async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(path, { ...options, headers, cache: "no-store" });
  } catch {
    throw new Error("Нет связи с API. Проверьте, что backend запущен.");
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401 && token && path !== "/api/admin/login") {
      clearToken();
      window.dispatchEvent(new Event("admin-session-expired"));
      throw new Error("Время сеанса истекло. Войдите снова.");
    }

    const message = Array.isArray(data?.message)
      ? data.message.join("; ")
      : data?.message;

    const readableMessage =
      message === "Invalid credentials"
        ? "Неверная почта или пароль."
        : message === "Internal server error"
          ? "Сервер не смог обработать запрос. Проверьте backend."
          : message;

    throw new Error(readableMessage || `Ошибка API: ${response.status}`);
  }

  return data as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ accessToken: string }>("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  list: (resource: string, page = 1) =>
    request<PagedResult<ContentItem>>(
      `/api/admin/content/${resource}?page=${page}&limit=20`,
    ),

  allCategories: async () => {
    const first = await request<PagedResult<ContentItem>>(
      "/api/admin/content/categories?page=1&limit=100",
    );
    const items = [...first.items];
    const pages = Math.ceil(first.total / 100);

    for (let page = 2; page <= pages; page += 1) {
      const result = await request<PagedResult<ContentItem>>(
        `/api/admin/content/categories?page=${page}&limit=100`,
      );
      items.push(...result.items);
    }

    return items;
  },

  create: (resource: string, body: Record<string, unknown>) =>
    request<ContentItem>(`/api/${resource}`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (
    resource: string,
    id: string,
    body: Record<string, unknown>,
    signal?: AbortSignal,
  ) =>
    request<ContentItem>(`/api/${resource}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
      signal,
    }),

  remove: (resource: string, id: string) =>
    request<{ deleted: boolean }>(`/api/${resource}/${id}`, {
      method: "DELETE",
    }),

  orders: () => request<Order[]>("/api/orders"),

  orderStatus: (id: string, status: Order["status"]) =>
    request<Order>(`/api/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  subscribers: () => request<Subscriber[]>("/api/admin/newsletter"),

  site: (section: "about" | "contact") =>
    request<Record<string, unknown> | null>(`/api/site/${section}`),

  saveSite: (section: "about" | "contact", body: Record<string, unknown>) =>
    request<Record<string, unknown>>(`/api/site/${section}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  upload: async (file: File) => {
    if (file.size > 15 * 1024 * 1024) {
      throw new Error("Файл должен быть не больше 15 МБ.");
    }

    const body = new FormData();
    body.append("file", file);

    return request<{ url: string }>("/api/admin/uploads", {
      method: "POST",
      body,
    });
  },
};
