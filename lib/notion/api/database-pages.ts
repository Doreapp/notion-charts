import { PageObjectResponse } from "@notionhq/client";
import { notionClient } from "../client";

export async function getAllDatabasePages(
  databaseId: string,
  limit: number = -1
) {
  let allPages: Array<PageObjectResponse> = [];
  let hasMore = true;
  let startCursor: string | undefined = undefined;

  while (hasMore && (limit < 0 || allPages.length < limit)) {
    const response = await notionClient.dataSources.query({
      data_source_id: databaseId,
      start_cursor: startCursor,
      page_size: 100,
    });

    allPages = allPages.concat(response.results as PageObjectResponse[]);
    hasMore = response.has_more;
    startCursor = response.next_cursor || undefined;
  }

  return allPages;
}
