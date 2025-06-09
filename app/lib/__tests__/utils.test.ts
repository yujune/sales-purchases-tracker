import { toDecimal } from "../utils";

describe("Utils", () => {
  describe("toDecimal", () => {
    it("should return the correct decimal value", () => {
      expect(toDecimal({ value: 1.23456, decimals: 2 })).toBe(1.23);
    });

    it("should return the correct decimal value", () => {
      expect(toDecimal({ value: 1.239, decimals: 2 })).toBe(1.24);
    });
  });
});
