import { processNotionDataForChart } from "../chart-processor";
import type { PageObjectResponse } from "@notionhq/client";

type PageProperty = PageObjectResponse["properties"][string];

function createMockPage(
  properties: Record<string, Partial<PageProperty>>
): PageObjectResponse {
  const propertiesItems = Object.entries(properties).map(([key, value]) => [
    key,
    {
      id: `property-${key}`,
      ...value,
    },
  ]);
  const propertiesObject = Object.fromEntries(propertiesItems);
  return {
    object: "page",
    id: "test-id",
    created_time: "2024-01-01T00:00:00.000Z",
    last_edited_time: "2024-01-01T00:00:00.000Z",
    created_by: { object: "user", id: "user-id" },
    last_edited_by: { object: "user", id: "user-id" },
    cover: null,
    icon: null,
    parent: { type: "database_id", database_id: "db-id" },
    archived: false,
    in_trash: false,
    properties: propertiesObject,
    url: "https://notion.so/test",
    public_url: null,
  } as PageObjectResponse;
}

type TextProperty<K extends PageProperty = PageProperty> = K extends {
  type: "title";
}
  ? K["title"][number]
  : never;
function createTextProperty(content: string): TextProperty {
  return {
    type: "text",
    text: { content, link: null },
    plain_text: content,
    href: null,
    annotations: {
      bold: false,
      italic: false,
      strikethrough: false,
      underline: false,
      code: false,
      color: "default",
    },
  };
}

describe("processNotionDataForChart", () => {
  describe("count aggregation", () => {
    it("should count pages grouped by x-axis value", () => {
      const pages = [
        createMockPage({
          category: {
            type: "select",
            select: { id: "1", name: "A", color: "default" },
          },
        }),
        createMockPage({
          category: {
            type: "select",
            select: { id: "2", name: "B", color: "default" },
          },
        }),
        createMockPage({
          category: {
            type: "select",
            select: { id: "1", name: "A", color: "default" },
          },
        }),
      ];

      const result = processNotionDataForChart(
        pages,
        "category",
        "select",
        "count"
      );

      expect(result.data).toHaveLength(2);
      expect(result.data.find((d) => d.name === "A")?.value).toBe(2);
      expect(result.data.find((d) => d.name === "B")?.value).toBe(1);
      expect(result.yAxisLabel).toBe("Count");
    });

    it("should handle empty pages array", () => {
      const result = processNotionDataForChart(
        [],
        "category",
        "select",
        "count"
      );

      expect(result.data).toEqual([]);
      expect(result.yAxisLabel).toBe("Count");
    });
  });

  describe("sum aggregation", () => {
    it("should sum y-axis values grouped by x-axis", () => {
      const pages = [
        createMockPage({
          category: {
            type: "select",
            select: { id: "1", name: "A", color: "default" },
          },
          amount: { type: "number", number: 10 },
        }),
        createMockPage({
          category: {
            type: "select",
            select: { id: "1", name: "A", color: "default" },
          },
          amount: { type: "number", number: 20 },
        }),
        createMockPage({
          category: {
            type: "select",
            select: { id: "2", name: "B", color: "default" },
          },
          amount: { type: "number", number: 5 },
        }),
      ];

      const result = processNotionDataForChart(
        pages,
        "category",
        "select",
        "sum",
        "amount"
      );

      expect(result.data).toHaveLength(2);
      expect(result.data.find((d) => d.name === "A")?.value).toBe(30);
      expect(result.data.find((d) => d.name === "B")?.value).toBe(5);
      expect(result.yAxisLabel).toBe("Sum");
    });

    it("should throw error when yAxisFieldId is missing for sum", () => {
      const pages = [
        createMockPage({
          category: {
            type: "select",
            select: { id: "1", name: "A", color: "default" },
          },
        }),
      ];

      expect(() => {
        processNotionDataForChart(pages, "category", "select", "sum");
      }).toThrow("Y axis field is required for aggregation type: sum");
    });
  });

  describe("avg aggregation", () => {
    it("should calculate average y-axis values grouped by x-axis", () => {
      const pages = [
        createMockPage({
          category: {
            type: "select",
            select: { id: "1", name: "A", color: "default" },
          },
          amount: { type: "number", number: 10 },
        }),
        createMockPage({
          category: {
            type: "select",
            select: { id: "1", name: "A", color: "default" },
          },
          amount: { type: "number", number: 20 },
        }),
        createMockPage({
          category: {
            type: "select",
            select: { id: "2", name: "B", color: "default" },
          },
          amount: { type: "number", number: 5 },
        }),
      ];

      const result = processNotionDataForChart(
        pages,
        "category",
        "select",
        "avg",
        "amount"
      );

      expect(result.data).toHaveLength(2);
      expect(result.data.find((d) => d.name === "A")?.value).toBe(15);
      expect(result.data.find((d) => d.name === "B")?.value).toBe(5);
      expect(result.yAxisLabel).toBe("Average");
    });
  });

  describe("date field handling", () => {
    it("should normalize dates to day level", () => {
      const pages = [
        createMockPage({
          date: {
            type: "date",
            date: {
              start: "2024-01-15T10:30:00Z",
              end: null,
              time_zone: "UTC",
            },
          },
        }),
        createMockPage({
          date: {
            type: "date",
            date: {
              start: "2024-01-15T14:45:00Z",
              end: null,
              time_zone: "UTC",
            },
          },
        }),
        createMockPage({
          date: {
            type: "date",
            date: {
              start: "2024-01-16T08:00:00Z",
              end: null,
              time_zone: "UTC",
            },
          },
        }),
      ];

      const result = processNotionDataForChart(pages, "date", "date", "count");

      expect(result.data).toHaveLength(2);
      expect(result.data.find((d) => d.name === "2024-01-15")?.value).toBe(2);
      expect(result.data.find((d) => d.name === "2024-01-16")?.value).toBe(1);
    });

    it("should fill missing days for date fields", () => {
      const pages = [
        createMockPage({
          date: {
            type: "date",
            date: { start: "2024-01-15", end: null, time_zone: "UTC" },
          },
        }),
        createMockPage({
          date: {
            type: "date",
            date: { start: "2024-01-17", end: null, time_zone: "UTC" },
          },
        }),
      ];

      const result = processNotionDataForChart(pages, "date", "date", "count");

      expect(result.data.length).toBeGreaterThan(2);
      expect(result.data.find((d) => d.name === "2024-01-15")?.value).toBe(1);
      expect(result.data.find((d) => d.name === "2024-01-16")?.value).toBe(0);
      expect(result.data.find((d) => d.name === "2024-01-17")?.value).toBe(1);
    });
  });

  describe("sorting", () => {
    it("should sort data in ascending order", () => {
      const pages = [
        createMockPage({
          value: { type: "number", number: 30 },
        }),
        createMockPage({
          value: { type: "number", number: 10 },
        }),
        createMockPage({
          value: { type: "number", number: 20 },
        }),
      ];

      const result = processNotionDataForChart(
        pages,
        "value",
        "number",
        "count",
        undefined,
        "asc"
      );

      expect(result.data.map((d) => d.name)).toEqual(["10", "20", "30"]);
    });

    it("should sort data in descending order", () => {
      const pages = [
        createMockPage({
          value: { type: "number", number: 10 },
        }),
        createMockPage({
          value: { type: "number", number: 30 },
        }),
        createMockPage({
          value: { type: "number", number: 20 },
        }),
      ];

      const result = processNotionDataForChart(
        pages,
        "value",
        "number",
        "count",
        undefined,
        "desc"
      );

      expect(result.data.map((d) => d.name)).toEqual(["30", "20", "10"]);
    });
  });

  describe("accumulation", () => {
    it("should accumulate values when accumulate is true", () => {
      const pages = [
        createMockPage({
          value: { type: "number", number: 5 },
        }),
        createMockPage({
          value: { type: "number", number: 3 },
        }),
        createMockPage({
          value: { type: "number", number: 2 },
        }),
      ];

      const result = processNotionDataForChart(
        pages,
        "value",
        "number",
        "count",
        undefined,
        "asc",
        true
      );

      const values = result.data.map((d) => d.value);
      expect(values[0]).toBe(1);
      expect(values[1]).toBe(2);
      expect(values[2]).toBe(3);
    });

    it("should not accumulate when accumulate is false", () => {
      const pages = [
        createMockPage({
          value: { type: "number", number: 5 },
        }),
        createMockPage({
          value: { type: "number", number: 3 },
        }),
      ];

      const result = processNotionDataForChart(
        pages,
        "value",
        "number",
        "count",
        undefined,
        "asc",
        false
      );

      const values = result.data.map((d) => d.value);
      expect(values).toEqual([1, 1]);
    });
  });

  describe("property types", () => {
    it("should handle title property", () => {
      const pages = [
        createMockPage({
          title: {
            type: "title",
            title: [createTextProperty("Page A")],
          },
        }),
        createMockPage({
          title: {
            type: "title",
            title: [createTextProperty("Page B")],
          },
        }),
      ];

      const result = processNotionDataForChart(
        pages,
        "title",
        "title",
        "count"
      );

      expect(result.data).toHaveLength(2);
      expect(result.data.find((d) => d.name === "Page A")?.value).toBe(1);
    });

    it("should handle number property as x-axis", () => {
      const pages = [
        createMockPage({
          value: { type: "number", number: 5 },
        }),
        createMockPage({
          value: { type: "number", number: 5 },
        }),
      ];

      const result = processNotionDataForChart(
        pages,
        "value",
        "number",
        "count"
      );

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe("5");
      expect(result.data[0].value).toBe(2);
    });
  });
});
