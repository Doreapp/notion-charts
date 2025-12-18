export class UnauthorizedError extends Error {
  constructor(message: string = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export const fetcher = <T>(...args: Parameters<typeof fetch>): Promise<T> => {
  const [url, init] = args;

  const modifiedInit: RequestInit = {
    ...init,
    credentials: "include",
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
