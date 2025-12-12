import { DatabaseWithProperties } from "@/types/notion";
import { NotionDatabase } from "@/lib/notion/api/databases";

export function parseDatabase(database: NotionDatabase): DatabaseWithProperties {
  return {
    id: database.id,
    title: database.title[0]?.plain_text ?? "Untitled",
    url: database.url,
    properties: Object.entries(database.properties).map(([id, property]) => ({
      id,
      name: property.name,
      type: property.type,
    })),
  };
}
