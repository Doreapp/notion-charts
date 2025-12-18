let authCheckCache: { value: boolean; timestamp: number } | null = null;
const AUTH_CHECK_CACHE_DURATION = 5000;

export async function hasSecret(): Promise<boolean> {
  if (typeof window === "undefined") {
    return false;
  }

  if (
    authCheckCache &&
    Date.now() - authCheckCache.timestamp < AUTH_CHECK_CACHE_DURATION
  ) {
    return authCheckCache.value;
  }

  try {
    const response = await fetch("/api/auth/check", {
      method: "GET",
      credentials: "include",
    });

    const isAuthenticated = response.ok;
    authCheckCache = {
      value: isAuthenticated,
      timestamp: Date.now(),
    };

    return isAuthenticated;
  } catch (error) {
    console.error("Error checking auth status:", error);
    authCheckCache = {
      value: false,
      timestamp: Date.now(),
    };
    return false;
  }
}

export async function clearSecret(): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  try {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });
    authCheckCache = null;
  } catch (error) {
    console.error("Error clearing secret:", error);
  }
}
