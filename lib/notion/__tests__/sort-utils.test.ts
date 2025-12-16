import { sortDataPoints } from "../sort-utils";
import type { ChartDataPoint } from "../chart-processor";

describe("sortDataPoints", () => {
  describe("number field type", () => {
    it("should sort numbers in ascending order", () => {
      const data: ChartDataPoint[] = [
        { name: "10", value: 10 },
        { name: "2", value: 2 },
        { name: "5", value: 5 },
        { name: "1", value: 1 },
      ];
      const result = sortDataPoints(data, "number", "asc");
      expect(result.map((d) => d.name)).toEqual(["1", "2", "5", "10"]);
    });

    it("should sort numbers in descending order", () => {
      const data: ChartDataPoint[] = [
        { name: "1", value: 1 },
        { name: "10", value: 10 },
        { name: "5", value: 5 },
        { name: "2", value: 2 },
      ];
      const result = sortDataPoints(data, "number", "desc");
      expect(result.map((d) => d.name)).toEqual(["10", "5", "2", "1"]);
    });

    it("should handle decimal numbers", () => {
      const data: ChartDataPoint[] = [
        { name: "3.14", value: 3.14 },
        { name: "1.5", value: 1.5 },
        { name: "2.7", value: 2.7 },
      ];
      const result = sortDataPoints(data, "number", "asc");
      expect(result.map((d) => d.name)).toEqual(["1.5", "2.7", "3.14"]);
    });

    it("should handle negative numbers", () => {
      const data: ChartDataPoint[] = [
        { name: "-5", value: -5 },
        { name: "10", value: 10 },
        { name: "-2", value: -2 },
        { name: "0", value: 0 },
      ];
      const result = sortDataPoints(data, "number", "asc");
      expect(result.map((d) => d.name)).toEqual(["-5", "-2", "0", "10"]);
    });

    it("should fall back to text comparison for invalid numbers", () => {
      const data: ChartDataPoint[] = [
        { name: "abc", value: 1 },
        { name: "10", value: 10 },
        { name: "xyz", value: 2 },
      ];
      const result = sortDataPoints(data, "number", "asc");
      expect(result[0].name).toBe("10");
      expect(result[1].name).toBe("abc");
      expect(result[2].name).toBe("xyz");
    });

    it("should handle mixed valid and invalid numbers", () => {
      const data: ChartDataPoint[] = [
        { name: "not-a-number", value: 1 },
        { name: "5", value: 5 },
        { name: "3", value: 3 },
        { name: "invalid", value: 2 },
      ];
      const result = sortDataPoints(data, "number", "asc");
      expect(result[0].name).toBe("3");
      expect(result[1].name).toBe("5");
      expect(result[2].name).toBe("invalid");
      expect(result[3].name).toBe("not-a-number");
    });
  });

  describe("date field types", () => {
    const dateData: ChartDataPoint[] = [
      { name: "2024-03-15", value: 15 },
      { name: "2024-01-10", value: 10 },
      { name: "2024-02-20", value: 20 },
      { name: "2024-01-01", value: 1 },
    ];

    it("should sort dates in ascending order for 'date' type", () => {
      const result = sortDataPoints(dateData, "date", "asc");
      expect(result.map((d) => d.name)).toEqual([
        "2024-01-01",
        "2024-01-10",
        "2024-02-20",
        "2024-03-15",
      ]);
    });

    it("should sort dates in descending order for 'date' type", () => {
      const result = sortDataPoints(dateData, "date", "desc");
      expect(result.map((d) => d.name)).toEqual([
        "2024-03-15",
        "2024-02-20",
        "2024-01-10",
        "2024-01-01",
      ]);
    });

    it("should sort dates for 'created_time' type", () => {
      const result = sortDataPoints(dateData, "created_time", "asc");
      expect(result.map((d) => d.name)).toEqual([
        "2024-01-01",
        "2024-01-10",
        "2024-02-20",
        "2024-03-15",
      ]);
    });

    it("should sort dates for 'last_edited_time' type", () => {
      const result = sortDataPoints(dateData, "last_edited_time", "asc");
      expect(result.map((d) => d.name)).toEqual([
        "2024-01-01",
        "2024-01-10",
        "2024-02-20",
        "2024-03-15",
      ]);
    });

    it("should handle ISO date strings with time", () => {
      const data: ChartDataPoint[] = [
        { name: "2024-01-15T10:30:00Z", value: 15 },
        { name: "2024-01-10T08:00:00Z", value: 10 },
        { name: "2024-01-20T12:00:00Z", value: 20 },
      ];
      const result = sortDataPoints(data, "date", "asc");
      expect(result.map((d) => d.name)).toEqual([
        "2024-01-10T08:00:00Z",
        "2024-01-15T10:30:00Z",
        "2024-01-20T12:00:00Z",
      ]);
    });

    it("should fall back to text comparison for invalid dates", () => {
      const data: ChartDataPoint[] = [
        { name: "invalid-date", value: 1 },
        { name: "2024-01-15", value: 15 },
        { name: "not-a-date", value: 2 },
      ];
      const result = sortDataPoints(data, "date", "asc");
      expect(result[0].name).toBe("2024-01-15");
      expect(result[1].name).toBe("invalid-date");
      expect(result[2].name).toBe("not-a-date");
    });

    it("should handle year boundaries", () => {
      const data: ChartDataPoint[] = [
        { name: "2024-01-01", value: 1 },
        { name: "2023-12-31", value: 31 },
        { name: "2024-12-31", value: 31 },
      ];
      const result = sortDataPoints(data, "date", "asc");
      expect(result.map((d) => d.name)).toEqual([
        "2023-12-31",
        "2024-01-01",
        "2024-12-31",
      ]);
    });
  });

  describe("text field types (default)", () => {
    it("should sort text in ascending order", () => {
      const data: ChartDataPoint[] = [
        { name: "zebra", value: 1 },
        { name: "apple", value: 2 },
        { name: "banana", value: 3 },
      ];
      const result = sortDataPoints(data, "title", "asc");
      expect(result.map((d) => d.name)).toEqual(["apple", "banana", "zebra"]);
    });

    it("should sort text in descending order", () => {
      const data: ChartDataPoint[] = [
        { name: "apple", value: 1 },
        { name: "banana", value: 2 },
        { name: "zebra", value: 3 },
      ];
      const result = sortDataPoints(data, "title", "desc");
      expect(result.map((d) => d.name)).toEqual(["zebra", "banana", "apple"]);
    });

    it("should handle case sensitivity using localeCompare", () => {
      const data: ChartDataPoint[] = [
        { name: "Apple", value: 1 },
        { name: "banana", value: 2 },
        { name: "Zebra", value: 3 },
      ];
      const result = sortDataPoints(data, "select", "asc");
      expect(result.map((d) => d.name)).toEqual(["Apple", "banana", "Zebra"]);
    });

    it("should handle numbers as text", () => {
      const data: ChartDataPoint[] = [
        { name: "10", value: 10 },
        { name: "2", value: 2 },
        { name: "100", value: 100 },
      ];
      const result = sortDataPoints(data, "rich_text", "asc");
      expect(result.map((d) => d.name)).toEqual(["10", "100", "2"]);
    });

    it("should handle empty strings", () => {
      const data: ChartDataPoint[] = [
        { name: "b", value: 2 },
        { name: "", value: 0 },
        { name: "a", value: 1 },
      ];
      const result = sortDataPoints(data, "status", "asc");
      expect(result[0].name).toBe("");
      expect(result[1].name).toBe("a");
      expect(result[2].name).toBe("b");
    });

    it("should handle special characters", () => {
      const data: ChartDataPoint[] = [
        { name: "item-2", value: 2 },
        { name: "item-10", value: 10 },
        { name: "item-1", value: 1 },
      ];
      const result = sortDataPoints(data, "text", "asc");
      expect(result.map((d) => d.name)).toEqual([
        "item-1",
        "item-10",
        "item-2",
      ]);
    });
  });

  describe("edge cases", () => {
    it("should handle empty array", () => {
      const result = sortDataPoints([], "number", "asc");
      expect(result).toEqual([]);
    });

    it("should handle single element", () => {
      const data: ChartDataPoint[] = [{ name: "5", value: 5 }];
      const result = sortDataPoints(data, "number", "asc");
      expect(result).toEqual(data);
    });

    it("should not mutate original array", () => {
      const data: ChartDataPoint[] = [
        { name: "3", value: 3 },
        { name: "1", value: 1 },
        { name: "2", value: 2 },
      ];
      const original = [...data];
      sortDataPoints(data, "number", "asc");
      expect(data).toEqual(original);
    });

    it("should preserve values when sorting", () => {
      const data: ChartDataPoint[] = [
        { name: "3", value: 300 },
        { name: "1", value: 100 },
        { name: "2", value: 200 },
      ];
      const result = sortDataPoints(data, "number", "asc");
      expect(result[0]).toEqual({ name: "1", value: 100 });
      expect(result[1]).toEqual({ name: "2", value: 200 });
      expect(result[2]).toEqual({ name: "3", value: 300 });
    });

    it("should handle very large numbers", () => {
      const data: ChartDataPoint[] = [
        { name: "999999999", value: 1 },
        { name: "1", value: 2 },
        { name: "1000000000", value: 3 },
      ];
      const result = sortDataPoints(data, "number", "asc");
      expect(result.map((d) => d.name)).toEqual([
        "1",
        "999999999",
        "1000000000",
      ]);
    });

    it("should handle dates far in the future", () => {
      const data: ChartDataPoint[] = [
        { name: "2099-12-31", value: 1 },
        { name: "2024-01-01", value: 2 },
        { name: "2050-06-15", value: 3 },
      ];
      const result = sortDataPoints(data, "date", "asc");
      expect(result.map((d) => d.name)).toEqual([
        "2024-01-01",
        "2050-06-15",
        "2099-12-31",
      ]);
    });
  });
});
