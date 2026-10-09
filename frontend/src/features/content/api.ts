import "server-only";
import { Locale, ListResult } from "./types";

const baseUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

async function request<T>(path: string, lang: Locale): Promise<T> {
  const url = new URL(`/api/${path.replace(/^\//, "")}`, baseUrl);
  url.searchParams.set("lang", lang === "tm" ? "tk" : lang);
  const response = await fetch(url, { next: { revalidate: 60 } });
  if (!response.ok) throw new Error(`API ${response.status}: ${url.pathname}`);
  return response.json() as Promise<T>;
}

export async function list<T>(resource: string, lang: Locale, query: Record<string, string> = {}): Promise<ListResult<T>> {
  const params = new URLSearchParams(query);
  try { return await request<ListResult<T>>(`${resource}?${params}`, lang); }
  catch (error) { console.error(`Failed to load ${resource}`, error); return { items: [], total: 0, page: 1, limit: 20, error: true }; }
}

export async function listAll<T>(resource: string, lang: Locale, query: Record<string, string> = {}): Promise<ListResult<T>> {
  const first = await list<T>(resource, lang, { ...query, page: "1", limit: "100" });
  if (first.error || first.total <= first.items.length) return first;
  const pageCount = Math.ceil(first.total / 100);
  const rest = await Promise.all(Array.from({ length: pageCount - 1 }, (_, index) =>
    list<T>(resource, lang, { ...query, page: String(index + 2), limit: "100" }),
  ));
  return {
    ...first,
    items: [...first.items, ...rest.flatMap((page) => page.items)],
    error: rest.some((page) => page.error),
  };
}

export async function one<T>(resource: string, id: string, lang: Locale): Promise<T | null> {
  try { return await request<T>(`${resource}/${encodeURIComponent(id)}`, lang); }
  catch (error) { console.error(`Failed to load ${resource}/${id}`, error); return null; }
}

export async function site<T>(resource: "about" | "contact", lang: Locale): Promise<T | null> {
  try { return await request<T>(`site/${resource}`, lang); }
  catch (error) { console.error(`Failed to load site/${resource}`, error); return null; }
}

export async function categoryTree(lang: Locale) {
  try { return await request<import("./types").Category[]>("categories/tree", lang); }
  catch (error) { console.error("Failed to load category tree", error); return []; }
}
