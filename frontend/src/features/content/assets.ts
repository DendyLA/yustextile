export function assetUrl(path?: string | null): string {
  if (!path) return "/images/heroSection/slide-1.webp";
  if (/^https?:\/\//i.test(path)) return path;
  if (/^\/(images|products|complexes|logos|icons|download|uploads)\//.test(path)) return path;
  return `${(process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000").replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}
