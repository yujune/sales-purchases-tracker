import { Transaction } from "@/data/database/entities";
import { TransactionRepository } from "@/data/repo/transaction/transaction_repo";
import { jest } from "@jest/globals";
import { getAffectedTransactionsAndRecalculate } from "../add-actions";

jest.mock("@/data/repo/transaction/transaction_repo");
jest.mock("@/app/lib/transaction-validation", () => ({
  checkSameDateTransactionExists: jest.fn(),
}));

describe("add-actions", () => {
  let mockTransactionRepository: jest.Mocked<TransactionRepository>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockTransactionRepository = {
      findAll: jest.fn(),
      getLatestTransaction: jest.fn(),
      updateExistingTransactions: jest.fn(),
    } as unknown as jest.Mocked<TransactionRepository>;

    (TransactionRepository as jest.Mock).mockImplementation(
      () => mockTransactionRepository
    );
  });

  describe("getAffectedTransactionsAndRecalculate", () => {
    it("should update all affected transactions with correct WAC and total inventory quantity. Scenario: add a purchase to past date", async () => {
      // Mock the new purchase (second purchase)
      const mockAffectingTransaction: Transaction = {
        id: "1",
        type: "PURCHASE",
        quantity: 150,
        unitPrice: 2,
        wac: 2,
        totalInventoryQuantity: 150,
        createdAt: new Date("2022-01-01"),
      };

      // Mock multiple affected transactions
      const mockAffectedTransactions: Transaction[] = [
        {
          id: "2",
          type: "PURCHASE",
          quantity: 10,
          unitPrice: 1.5,
          wac: 1.5,
          totalInventoryQuantity: 10,
          createdAt: new Date("2022-01-05"),
        },
        {
          id: "3",
          type: "SALE",
          quantity: 5,
          unitPrice: 10,
          wac: 1.5,
          totalInventoryQuantity: 5,
          createdAt: new Date("2022-01-07"),
        },
      ];

      // Setup mock implementations
      mockTransactionRepository.findAll.mockResolvedValue(
        mockAffectedTransactions
      );

      const result = await getAffectedTransactionsAndRecalculate({
        affectingTransaction: mockAffectingTransaction,
      });

      expect(mockTransactionRepository.findAll).toHaveBeenCalledWith({
        fromDate: mockAffectingTransaction.createdAt,
      });

      // Verify the recalculated values for each transaction
      expect(result).toHaveLength(2);

      // First transaction (purchase)
      expect(result[0].wac).toBeCloseTo(1.97);
      expect(result[0].totalInventoryQuantity).toBe(160);

      // Second transaction (sale)
      expect(result[1].wac).toBeCloseTo(1.97);
      expect(result[1].totalInventoryQuantity).toBe(155);
    });
  });
});
