import { getStoredSecret } from "./secret-storage";

export const fetcher = <T>(...args: Parameters<typeof fetch>): Promise<T> => {
  const [url, init] = args;
  const secret = getStoredSecret();

  const headers = new Headers(init?.headers);

  if (secret) {
    headers.set("Authorization", `Bearer ${secret}`);
  }

  const modifiedInit: RequestInit = {
    ...init,
    headers,
  };

  return fetch(url, modifiedInit).then((res) => res.json()) as Promise<T>;
};
