import {
  normalizeDateToDay,
  isDateFieldType,
  getAllDaysInRange,
  fillMissingDays,
} from "../date-utils";
import type { ChartDataPoint } from "../chart-processor";

describe("normalizeDateToDay", () => {
  it("should convert ISO date string to YYYY-MM-DD format", () => {
    expect(normalizeDateToDay("2024-01-15T10:30:00Z")).toBe("2024-01-15");
    expect(normalizeDateToDay("2024-12-31T23:59:59Z")).toBe("2024-12-31");
  });

  it("should handle date strings without time", () => {
    expect(normalizeDateToDay("2024-01-15")).toBe("2024-01-15");
    expect(normalizeDateToDay("2024-12-31")).toBe("2024-12-31");
  });

  it("should handle dates with timezone offsets", () => {
    expect(normalizeDateToDay("2024-01-15T10:30:00+05:00")).toBe("2024-01-15");
    expect(normalizeDateToDay("2024-01-15T10:30:00-05:00")).toBe("2024-01-15");
  });

  it("should return null for invalid date strings", () => {
    expect(normalizeDateToDay("invalid-date")).toBeNull();
    expect(normalizeDateToDay("")).toBeNull();
    expect(normalizeDateToDay("not-a-date")).toBeNull();
  });

  it("should handle various date formats", () => {
    expect(normalizeDateToDay("2024-01-01T00:00:00.000Z")).toBe("2024-01-01");
    expect(normalizeDateToDay("2024-06-15T12:00:00Z")).toBe("2024-06-15");
  });
});

describe("isDateFieldType", () => {
  it("should return true for date field types", () => {
    expect(isDateFieldType("date")).toBe(true);
    expect(isDateFieldType("created_time")).toBe(true);
    expect(isDateFieldType("last_edited_time")).toBe(true);
  });

  it("should return false for non-date field types", () => {
    expect(isDateFieldType("title")).toBe(false);
    expect(isDateFieldType("number")).toBe(false);
    expect(isDateFieldType("select")).toBe(false);
    expect(isDateFieldType("rich_text")).toBe(false);
    expect(isDateFieldType("checkbox")).toBe(false);
    expect(isDateFieldType("status")).toBe(false);
  });

  it("should return false for empty or undefined-like strings", () => {
    expect(isDateFieldType("")).toBe(false);
  });
});

describe("getAllDaysInRange", () => {
  it("should return single day when start and end are the same", () => {
    const result = getAllDaysInRange("2024-01-15", "2024-01-15");
    expect(result).toEqual(["2024-01-15"]);
  });

  it("should return all days in a range", () => {
    const result = getAllDaysInRange("2024-01-15", "2024-01-17");
    expect(result).toEqual(["2024-01-15", "2024-01-16", "2024-01-17"]);
  });

  it("should handle multi-day ranges", () => {
    const result = getAllDaysInRange("2024-01-01", "2024-01-05");
    expect(result).toEqual([
      "2024-01-01",
      "2024-01-02",
      "2024-01-03",
      "2024-01-04",
      "2024-01-05",
    ]);
  });

  it("should handle month boundaries", () => {
    const result = getAllDaysInRange("2024-01-31", "2024-02-02");
    expect(result).toEqual(["2024-01-31", "2024-02-01", "2024-02-02"]);
  });

  it("should handle year boundaries", () => {
    const result = getAllDaysInRange("2023-12-31", "2024-01-02");
    expect(result).toEqual(["2023-12-31", "2024-01-01", "2024-01-02"]);
  });

  it("should handle leap year February", () => {
    const result = getAllDaysInRange("2024-02-28", "2024-03-01");
    expect(result).toEqual(["2024-02-28", "2024-02-29", "2024-03-01"]);
  });

  it("should handle non-leap year February", () => {
    const result = getAllDaysInRange("2023-02-28", "2023-03-01");
    expect(result).toEqual(["2023-02-28", "2023-03-01"]);
  });

  it("should handle longer ranges", () => {
    const result = getAllDaysInRange("2024-01-01", "2024-01-07");
    expect(result).toHaveLength(7);
    expect(result[0]).toBe("2024-01-01");
    expect(result[6]).toBe("2024-01-07");
  });
});

describe("fillMissingDays", () => {
  it("should return empty array when input is empty", () => {
    const result = fillMissingDays([]);
    expect(result).toEqual([]);
  });

  it("should return same data when no days are missing", () => {
    const data: ChartDataPoint[] = [
      { name: "2024-01-15", value: 5 },
      { name: "2024-01-16", value: 10 },
      { name: "2024-01-17", value: 15 },
    ];
    const result = fillMissingDays(data);
    expect(result).toEqual(data);
  });

  it("should fill missing days with 0", () => {
    const data: ChartDataPoint[] = [
      { name: "2024-01-15", value: 5 },
      { name: "2024-01-17", value: 15 },
    ];
    const result = fillMissingDays(data);
    expect(result).toEqual([
      { name: "2024-01-15", value: 5 },
      { name: "2024-01-16", value: 0 },
      { name: "2024-01-17", value: 15 },
    ]);
  });

  it("should fill multiple missing days", () => {
    const data: ChartDataPoint[] = [
      { name: "2024-01-15", value: 5 },
      { name: "2024-01-18", value: 20 },
    ];
    const result = fillMissingDays(data);
    expect(result).toEqual([
      { name: "2024-01-15", value: 5 },
      { name: "2024-01-16", value: 0 },
      { name: "2024-01-17", value: 0 },
      { name: "2024-01-18", value: 20 },
    ]);
  });

  it("should handle missing days at the beginning", () => {
    const data: ChartDataPoint[] = [
      { name: "2024-01-15", value: 5 },
      { name: "2024-01-16", value: 10 },
    ];
    const result = fillMissingDays(data);
    expect(result).toEqual([
      { name: "2024-01-15", value: 5 },
      { name: "2024-01-16", value: 10 },
    ]);
  });

  it("should handle missing days at the end", () => {
    const data: ChartDataPoint[] = [
      { name: "2024-01-15", value: 5 },
      { name: "2024-01-16", value: 10 },
    ];
    const result = fillMissingDays(data);
    expect(result).toEqual([
      { name: "2024-01-15", value: 5 },
      { name: "2024-01-16", value: 10 },
    ]);
  });

  it("should handle large gaps", () => {
    const data: ChartDataPoint[] = [
      { name: "2024-01-01", value: 1 },
      { name: "2024-01-10", value: 10 },
    ];
    const result = fillMissingDays(data);
    expect(result).toHaveLength(10);
    expect(result[0]).toEqual({ name: "2024-01-01", value: 1 });
    expect(result[9]).toEqual({ name: "2024-01-10", value: 10 });
    expect(result[1].value).toBe(0);
    expect(result[8].value).toBe(0);
  });

  it("should preserve original values for existing days", () => {
    const data: ChartDataPoint[] = [
      { name: "2024-01-15", value: 5 },
      { name: "2024-01-17", value: 15 },
      { name: "2024-01-19", value: 25 },
    ];
    const result = fillMissingDays(data);
    expect(result[0].value).toBe(5);
    expect(result[2].value).toBe(15);
    expect(result[4].value).toBe(25);
    expect(result[1].value).toBe(0);
    expect(result[3].value).toBe(0);
  });

  it("should handle month boundaries correctly", () => {
    const data: ChartDataPoint[] = [
      { name: "2024-01-31", value: 31 },
      { name: "2024-02-02", value: 2 },
    ];
    const result = fillMissingDays(data);
    expect(result).toEqual([
      { name: "2024-01-31", value: 31 },
      { name: "2024-02-01", value: 0 },
      { name: "2024-02-02", value: 2 },
    ]);
  });
});
