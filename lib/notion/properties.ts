import { NotionDatabase } from "./api/databases";
import { getAllDatabasePages } from "./api/database-pages";
import { GetPageResponse, PageObjectResponse } from "@notionhq/client";

export async function enrichProperties(database: NotionDatabase) {
  for (const property of Object.values(database.properties)) {
    if (property.type === "relation") {
      await enrichRelationProperty(property);
    }
  }
  return database;
}

type RelationProperty = Extract<
  NotionDatabase["properties"][string],
  { type: "relation" }
>;
type EnrichedRelationProperty = RelationProperty & {
  relation: RelationProperty["relation"] & {
    options?: {
      id: string;
      name?: string;
    }[];
  };
};
/** Inplace enrich a relation property with the options of the pages it points to */
async function enrichRelationProperty(property: EnrichedRelationProperty) {
  if (!("relation" in property)) return;

  const relation = property.relation;
  if (!relation) return;

  let pages: PageObjectResponse[] = [];
  try {
    pages = await getAllDatabasePages(relation.data_source_id, {
      filterProperties: ["title"],
    });
  } catch (error) {
    console.warn("Error enriching relation property", error);
    return;
  }

  const titleProperty = findTitleProperty(pages[0]);
  if (!titleProperty) return;

  property.relation.options = pages.map((p) => {
    const title = p.properties[titleProperty];
    return {
      id: p.id,
      name:
        title && "title" in title ? title.title?.[0]?.plain_text : undefined,
    };
  });
}

export function findTitleProperty(page: GetPageResponse): string | undefined {
  if (!("properties" in page)) {
    return undefined;
  }
  return Object.entries(page.properties).find(
    ([, property]) => property.type === "title"
  )?.[0];
}
