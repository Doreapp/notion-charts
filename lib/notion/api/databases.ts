import { DataSourceObjectResponse } from "@notionhq/client";
import { notionClient } from "../client";

export type NotionDatabase = DataSourceObjectResponse;

export async function getDatabases() {
  const response = await notionClient.search({
    filter: {
      property: "object",
      value: "data_source",
    },
  });

  const databases: NotionDatabase[] = response.results.filter(
    (result): result is NotionDatabase =>
      result.object === "data_source" && "title" in result
  ) as NotionDatabase[];

  return databases;
}
