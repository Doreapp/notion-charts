import { getSecretFromStorage } from "./secret-storage";

export class UnauthorizedError extends Error {
  constructor(message: string = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export const fetcher = <T>(...args: Parameters<typeof fetch>): Promise<T> => {
  const [url, init] = args;

  const headers = new Headers(init?.headers);
  const secret = getSecretFromStorage();

  if (secret) {
    headers.set("Authorization", `Bearer ${secret}`);
  }

  const modifiedInit: RequestInit = {
    ...init,
    headers,
  };

  return fetch(url, modifiedInit).then(async (res) => {
    if (res.status === 401) {
      throw new UnauthorizedError("Invalid or missing API secret");
    }
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Request failed with status ${res.status}`
      );
    }
    return res.json() as Promise<T>;
  });
};
