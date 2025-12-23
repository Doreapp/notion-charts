// eslint-disable-next-line @typescript-eslint/no-require-imports
const fetch = require("node-fetch");

if (!globalThis.fetch) {
  globalThis.fetch = fetch;
  globalThis.Headers = fetch.Headers;
  globalThis.Request = fetch.Request;
  globalThis.Response = fetch.Response;
}

process.env.NODE_ENV = "test";

process.env.NOTION_INTEGRATION_SECRET = "test-secret";
process.env.API_SECRET = "test-api-secret";
