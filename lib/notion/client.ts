import { Client } from "@notionhq/client";

if (!process.env.NOTION_INTEGRATION_SECRET) {
  throw new Error("NOTION_INTEGRATION_SECRET is not set in environment variables");
}

export const notionClient = new Client({
  auth: process.env.NOTION_INTEGRATION_SECRET,
});
