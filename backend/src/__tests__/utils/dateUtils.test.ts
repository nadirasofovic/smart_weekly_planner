import { getWeekStartDate, getISOWeek } from "../../routes/weeks";

describe("Date Utilities", () => {
  describe("getWeekStartDate", () => {
    it("should return correct week start date", () => {
      const weekStart = getWeekStartDate(2024, 3);
      expect(weekStart).toBeInstanceOf(Date);
    });
  });

  describe("getISOWeek", () => {
    it("should calculate ISO week number", () => {
      const date = new Date(2024, 0, 15); // January 15, 2024
      const week = getISOWeek(date);
      expect(typeof week).toBe("number");
      expect(week).toBeGreaterThan(0);
      expect(week).toBeLessThanOrEqual(53);
    });
  });
});

