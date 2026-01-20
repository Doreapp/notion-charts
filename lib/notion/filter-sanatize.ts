import type { FilterCondition } from "@/types/notion";
import { GetDataSourceResponse } from "@notionhq/client";

/**
 * Ensure the filters are valid given the database properties and sanatize the values if necessary.
 */
export function sanitizeFilters(
  filters: FilterCondition[] | undefined,
  database: GetDataSourceResponse
): { filters: FilterCondition[] | undefined; error?: string } {
  if (!filters || filters.length === 0) {
    return { filters, error: undefined };
  }
  const sanitizedFilters = JSON.parse(JSON.stringify(filters));
  for (const filter of sanitizedFilters) {
    const property = database.properties[filter.propertyId];
    if (!property) {
      return {
        filters: sanitizedFilters,
        error: `Filter property ${filter.propertyId} not found in database`,
      };
    }
    if (property.type !== filter.propertyType) {
      return {
        filters: sanitizedFilters,
        error: `Filter property type mismatch for ${filter.propertyId}`,
      };
    }
    if (filter.propertyType === "status" && property.type === "status") {
      filter.value =
        property.status?.options?.find((o) => o.id === filter.value)?.name ??
        filter.value;
    }
  }
  return { filters: sanitizedFilters, error: undefined };
}
