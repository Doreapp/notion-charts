import { PageObjectResponse } from "@notionhq/client";
import { notionClient } from "../client";
import type { FilterCondition } from "@/types/notion";
import { convertFiltersToNotionFilter } from "../filter-converter";

type GetAllDatabasePagesOptions = {
  limit?: number;
  filters?: FilterCondition[];
  filterProperties?: string[];
};

export async function getAllDatabasePages(
  databaseId: string,
  options: GetAllDatabasePagesOptions = {}
) {
  const { limit = -1, filters = [], filterProperties = [] } = options;
  let allPages: Array<PageObjectResponse> = [];
  let hasMore = true;
  let startCursor: string | undefined = undefined;

  const notionFilter =
    filters && filters.length > 0
      ? convertFiltersToNotionFilter(filters)
      : undefined;

  while (hasMore && (limit < 0 || allPages.length < limit)) {
    const queryParams = {
      data_source_id: databaseId,
      start_cursor: startCursor,
      page_size: 100,
      filter: notionFilter,
      filter_properties: filterProperties,
    };

    const response = await notionClient.dataSources.query(queryParams);

    allPages = allPages.concat(response.results as PageObjectResponse[]);
    hasMore = response.has_more;
    startCursor = response.next_cursor || undefined;
  }

  return allPages;
}
