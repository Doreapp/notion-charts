const STORAGE_KEY = "api_secret";

export function getSecretFromStorage(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error reading secret from storage:", error);
    return null;
  }
}

export function setSecretInStorage(secret: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, secret);
  } catch (error) {
    console.error("Error storing secret:", error);
  }
}

function removeSecretFromStorage(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error removing secret from storage:", error);
  }
}

export function hasSecret(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return getSecretFromStorage() !== null;
}

export async function clearSecret(): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  removeSecretFromStorage();
}
