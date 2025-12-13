const SECRET_STORAGE_KEY = "api_secret";

export function getStoredSecret(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return sessionStorage.getItem(SECRET_STORAGE_KEY);
  } catch (error) {
    console.error("Error reading secret from sessionStorage:", error);
    return null;
  }
}

export function storeSecret(secret: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    sessionStorage.setItem(SECRET_STORAGE_KEY, secret);
  } catch (error) {
    console.error("Error storing secret in sessionStorage:", error);
    throw error;
  }
}

export function clearSecret(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    sessionStorage.removeItem(SECRET_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing secret from sessionStorage:", error);
  }
}

export function hasSecret(): boolean {
  return getStoredSecret() !== null;
}
