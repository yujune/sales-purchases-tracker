import "@jest/globals";
import { NewTransaction, TransactionType } from "../../data/database/entities";
import {
  calculateNewTotalInventoryQuantity,
  calculateNewWac,
  calculateWacAndTotalInventoryQuantity,
  constructNewTransaction,
} from "../transaction-calculation";

describe("Transaction Calculation", () => {
  const mockDate = new Date("2024-01-01");

  describe("constructNewTransaction", () => {
    it("should construct a new transaction with correct values when there is no previous transaction", () => {
      const baseTransaction = {
        quantity: 150,
        unitPrice: 2,
        createdAt: mockDate,
        type: "PURCHASE" as TransactionType,
      };

      const result = constructNewTransaction(null, baseTransaction);

      expect(result).toEqual({
        quantity: 150,
        unitPrice: 2,
        type: "PURCHASE",
        wac: 2,
        totalInventoryQuantity: 150,
        createdAt: mockDate,
      });
    });

    it("should construct a new transaction with calculated WAC when there is a previous transaction", () => {
      const lastTransaction: NewTransaction = {
        quantity: 150,
        unitPrice: 2,
        type: "PURCHASE",
        wac: 2,
        totalInventoryQuantity: 150,
        createdAt: mockDate,
      };

      const baseTransaction = {
        quantity: 10,
        unitPrice: 1.5,
        createdAt: mockDate,
        type: "PURCHASE" as TransactionType,
      };

      const result = constructNewTransaction(lastTransaction, baseTransaction);

      expect(result).toEqual({
        quantity: 10,
        unitPrice: 1.5,
        type: "PURCHASE",
        wac: 1.96875,
        totalInventoryQuantity: 160,
        createdAt: mockDate,
      });
    });
  });

  describe("calculateNewWac", () => {
    it("should return previous WAC for sale transactions, new sale won't affect wac", () => {
      const lastPurchase: NewTransaction = {
        quantity: 150,
        unitPrice: 2,
        type: "PURCHASE",
        wac: 2,
        totalInventoryQuantity: 150,
        createdAt: mockDate,
      };

      const saleTransaction = {
        quantity: 5,
        unitPrice: 10,
        createdAt: mockDate,
        type: "SALE" as TransactionType,
      };

      const result = calculateNewWac(lastPurchase, saleTransaction);
      expect(result).toBe(2);
    });

    it("should calculate new WAC for purchase transactions", () => {
      const lastPurchase: NewTransaction = {
        quantity: 150,
        unitPrice: 2,
        type: "PURCHASE",
        wac: 2,
        totalInventoryQuantity: 150,
        createdAt: mockDate,
      };

      const newPurchase = {
        quantity: 10,
        unitPrice: 1.5,
        createdAt: mockDate,
        type: "PURCHASE" as TransactionType,
      };

      const result = calculateNewWac(lastPurchase, newPurchase);
      expect(result).toBe(1.96875);
    });
  });

  describe("calculateNewTotalInventoryQuantity", () => {
    it("should add quantity for purchase transactions", () => {
      const lastPurchase: NewTransaction = {
        quantity: 150,
        unitPrice: 2,
        type: "PURCHASE",
        wac: 2,
        totalInventoryQuantity: 150,
        createdAt: mockDate,
      };

      const newPurchase = {
        quantity: 10,
        unitPrice: 1.5,
        createdAt: mockDate,
        type: "PURCHASE" as TransactionType,
      };

      const result = calculateNewTotalInventoryQuantity(
        lastPurchase,
        newPurchase
      );
      expect(result).toBe(160);
    });

    it("should subtract quantity for sale transactions", () => {
      const lastPurchase: NewTransaction = {
        quantity: 150,
        unitPrice: 2,
        type: "PURCHASE",
        wac: 2,
        totalInventoryQuantity: 150,
        createdAt: mockDate,
      };

      const saleTransaction = {
        quantity: 5,
        unitPrice: 10,
        createdAt: mockDate,
        type: "SALE" as TransactionType,
      };

      const result = calculateNewTotalInventoryQuantity(
        lastPurchase,
        saleTransaction
      );
      expect(result).toBe(145);
    });
  });

  describe("calculateWacAndTotalInventoryQuantity", () => {
    it("should return initial values when there is no previous transaction", () => {
      const baseTransaction = {
        quantity: 150,
        unitPrice: 2,
        createdAt: mockDate,
        type: "PURCHASE" as TransactionType,
      };

      const result = calculateWacAndTotalInventoryQuantity(
        null,
        baseTransaction
      );

      expect(result).toEqual({
        wac: 2,
        totalInventoryQuantity: 150,
      });
    });

    it("should calculate new values when there is a previous transaction", () => {
      const lastTransaction: NewTransaction = {
        quantity: 150,
        unitPrice: 2,
        type: "PURCHASE",
        wac: 2,
        totalInventoryQuantity: 150,
        createdAt: mockDate,
      };

      const baseTransaction = {
        quantity: 10,
        unitPrice: 1.5,
        createdAt: mockDate,
        type: "PURCHASE" as TransactionType,
      };

      const result = calculateWacAndTotalInventoryQuantity(
        lastTransaction,
        baseTransaction
      );

      expect(result).toEqual({
        wac: 1.96875,
        totalInventoryQuantity: 160,
      });
    });
  });
});
