import { DatabaseWithProperties } from "@/types/notion";
import { NotionDatabase } from "@/lib/notion/api/databases";

export function parseDatabase(
  database: NotionDatabase
): DatabaseWithProperties {
  return {
    id: database.id,
    title: database.title[0]?.plain_text ?? "Untitled",
    url: database.url,
    properties: Object.entries(database.properties).map(([id, property]) => {
      const baseProperty = {
        id,
        name: property.name,
        type: property.type,
      };

      if (
        property.type === "select" &&
        "select" in property &&
        property.select
      ) {
        return {
          ...baseProperty,
          options: property.select.options?.map((option) => ({
            id: option.id,
            name: option.name,
          })),
        };
      }

      if (
        property.type === "status" &&
        "status" in property &&
        property.status
      ) {
        return {
          ...baseProperty,
          options: property.status.options?.map((option) => ({
            id: option.id,
            name: option.name,
          })),
        };
      }

      return baseProperty;
    }),
  };
}
