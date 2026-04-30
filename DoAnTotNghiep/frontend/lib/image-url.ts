const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:8080";

export function getImageUrl(url?: string | null): string {
  if (!url) return "/placeholder.svg";

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  if (url.startsWith("/uploads")) {
    return `${BACKEND_ORIGIN}${url}`;
  }

  if (url.startsWith("/")) {
    return url;
  }

  return `/${url}`;
}