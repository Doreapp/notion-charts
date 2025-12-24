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

      const typesToCheck = ["select", "status", "relation"] as const;
      for (const type of typesToCheck) {
        if (property.type === type && type in property) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const options = (property as any)[type].options;
          return {
            ...baseProperty,
            options: options?.map((option: { id: string; name: string }) => ({
              id: option.id,
              name: option.name,
            })),
          };
        }
      }

      return baseProperty;
    }),
  };
}
