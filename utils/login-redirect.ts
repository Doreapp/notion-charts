export function buildLoginRedirectUrl(targetUrl: string): string {
  const encodedNext = encodeURIComponent(targetUrl);
  return `/?next=${encodedNext}`;
}

export function getNextUrlFromParams(
  searchParams: URLSearchParams
): string | null {
  const nextParam = searchParams.get("next");
  if (!nextParam) {
    return null;
  }

  try {
    return decodeURIComponent(nextParam);
  } catch (e) {
    console.error("Failed to decode next parameter", e);
    return null;
  }
}

export function getCurrentUrlWithParams(): string {
  if (typeof window === "undefined") {
    return "/config";
  }

  return window.location.pathname + window.location.search;
}
