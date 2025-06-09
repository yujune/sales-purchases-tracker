import { calculateWacAndTotalInventoryQuantity } from "@/app/lib/transaction-calculation";
import { Transaction } from "@/data/database/entities";
import { TransactionRepository } from "@/data/repo/transaction/transaction_repo";
import {
  getAffectedTransactionsAndRecalculate,
  updateTransaction,
} from "../update-actions";

jest.mock("@/data/repo/transaction/transaction_repo");

jest.mock("@/app/lib/transaction-calculation", () => ({
  calculateWacAndTotalInventoryQuantity: jest.fn(),
}));

describe("update-actions", () => {
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
    it("should recalculate WAC and total inventory quantity for affected transactions after an update", async () => {
      // Example scenario from project description:
      // 1. First purchase: 150 items at RM2 each on 01/01/2022
      // 2. Second purchase: 10 items at RM1.50 each on 05/01/2022
      // 3. Sale: 5 items on 07/01/2022

      // Mock the updated transaction (second purchase with new values)
      const mockAffectingTransaction: Transaction = {
        id: "2",
        type: "PURCHASE",
        quantity: 15, // Updated from 10 to 15
        unitPrice: 1.75, // Updated from 1.50 to 1.75
        wac: 1.97,
        totalInventoryQuantity: 160,
        createdAt: new Date("2022-01-05"),
      };

      // Mock the affected transactions (sale)
      const mockAffectedTransactions: Transaction[] = [
        {
          id: "3",
          type: "SALE",
          quantity: 5,
          unitPrice: 0,
          wac: 1.97,
          totalInventoryQuantity: 155,
          createdAt: new Date("2022-01-07"),
        },
      ];

      mockTransactionRepository.findAll.mockResolvedValue(
        mockAffectedTransactions
      );

      // Mock calculateWacAndTotalInventoryQuantity to return recalculated values
      (
        calculateWacAndTotalInventoryQuantity as jest.Mock
      ).mockImplementationOnce(() => ({
        wac: 1.98, // New WAC after updating second purchase
        totalInventoryQuantity: 160, // 150 + 15 - 5 = 160
      }));

      const result = await getAffectedTransactionsAndRecalculate({
        affectingTransaction: mockAffectingTransaction,
      });

      expect(mockTransactionRepository.findAll).toHaveBeenCalledWith({
        fromDate: mockAffectingTransaction.createdAt,
      });

      // Verify calculateWacAndTotalInventoryQuantity was called correctly
      expect(calculateWacAndTotalInventoryQuantity).toHaveBeenCalledWith(
        mockAffectingTransaction,
        {
          quantity: mockAffectedTransactions[0].quantity,
          unitPrice: mockAffectedTransactions[0].unitPrice,
          date: mockAffectedTransactions[0].createdAt,
          type: mockAffectedTransactions[0].type,
        }
      );

      // Verify the recalculated values
      expect(result).toHaveLength(1);
      expect(result[0].wac).toBeCloseTo(1.98, 2);
      expect(result[0].totalInventoryQuantity).toBe(160);
    });
  });

  describe("updateTransaction", () => {
    it("should update a transaction and recalculate all affected transactions", async () => {
      // Mock the transaction to be updated (second purchase)
      const mockTransaction: Transaction = {
        id: "2",
        type: "PURCHASE",
        quantity: 15, // Updated from 10 to 15
        unitPrice: 1.75, // Updated from 1.50 to 1.75
        wac: 1.97,
        totalInventoryQuantity: 160,
        createdAt: new Date("2022-01-05"),
      };

      // Mock the last transaction before the updated one (first purchase)
      const mockLastTransaction: Transaction = {
        id: "1",
        type: "PURCHASE",
        quantity: 150,
        unitPrice: 2.0,
        wac: 2.0,
        totalInventoryQuantity: 150,
        createdAt: new Date("2022-01-01"),
      };

      // Mock the affected transactions (sale)
      const mockAffectedTransactions: Transaction[] = [
        {
          id: "3",
          type: "SALE",
          quantity: 5,
          unitPrice: 0,
          wac: 1.98,
          totalInventoryQuantity: 160,
          createdAt: new Date("2022-01-07"),
        },
      ];

      // Setup mock implementations
      mockTransactionRepository.getLatestTransaction.mockResolvedValue(
        mockLastTransaction
      );
      mockTransactionRepository.findAll.mockResolvedValue(
        mockAffectedTransactions
      );

      // Mock calculateWacAndTotalInventoryQuantity for initial update
      (calculateWacAndTotalInventoryQuantity as jest.Mock)
        .mockImplementationOnce(() => ({
          wac: 1.98, // New WAC for updated transaction
          totalInventoryQuantity: 165, // 150 + 15 = 165
        }))
        .mockImplementationOnce(() => ({
          wac: 1.98, // WAC remains same after sale
          totalInventoryQuantity: 160, // 165 - 5 = 160
        }));

      await updateTransaction(mockTransaction);

      expect(
        mockTransactionRepository.getLatestTransaction
      ).toHaveBeenCalledWith({
        byDate: mockTransaction.createdAt,
      });

      // Verify the updated transaction and affected transactions are saved
      expect(
        mockTransactionRepository.updateExistingTransactions
      ).toHaveBeenCalledWith([
        {
          ...mockTransaction,
          wac: 1.98,
          totalInventoryQuantity: 165,
        },
        ...mockAffectedTransactions,
      ]);
    });

    it("should handle updating the first transaction and recalculate all subsequent transactions", async () => {
      // Mock the transaction to be updated (first purchase)
      const mockTransaction: Transaction = {
        id: "1",
        type: "PURCHASE",
        quantity: 200, // Updated from 150 to 200
        unitPrice: 2.25, // Updated from 2.00 to 2.25
        wac: 2.0,
        totalInventoryQuantity: 150,
        createdAt: new Date("2022-01-01"),
      };

      // Mock the affected transactions (second purchase and sale)
      const mockAffectedTransactions: Transaction[] = [
        {
          id: "2",
          type: "PURCHASE",
          quantity: 10,
          unitPrice: 1.5,
          wac: 1.97,
          totalInventoryQuantity: 160,
          createdAt: new Date("2022-01-05"),
        },
        {
          id: "3",
          type: "SALE",
          quantity: 5,
          unitPrice: 0,
          wac: 1.97,
          totalInventoryQuantity: 155,
          createdAt: new Date("2022-01-07"),
        },
      ];

      mockTransactionRepository.getLatestTransaction.mockResolvedValue(null); // No previous transaction
      mockTransactionRepository.findAll.mockResolvedValue(
        mockAffectedTransactions
      );

      // Mock calculateWacAndTotalInventoryQuantity for initial update and affected transactions
      (calculateWacAndTotalInventoryQuantity as jest.Mock)
        .mockImplementationOnce(() => ({
          wac: 2.25, // New WAC for updated first purchase
          totalInventoryQuantity: 200, // Updated quantity
        }))
        .mockImplementationOnce(() => ({
          wac: 2.2, // New WAC after second purchase
          totalInventoryQuantity: 210, // 200 + 10
        }))
        .mockImplementationOnce(() => ({
          wac: 2.2, // WAC remains same after sale
          totalInventoryQuantity: 205, // 210 - 5
        }));

      await updateTransaction(mockTransaction);

      expect(
        mockTransactionRepository.getLatestTransaction
      ).toHaveBeenCalledWith({
        byDate: mockTransaction.createdAt,
      });

      // Verify the updated transaction and affected transactions are saved
      expect(
        mockTransactionRepository.updateExistingTransactions
      ).toHaveBeenCalledWith([
        {
          ...mockTransaction,
          wac: 2.25,
          totalInventoryQuantity: 200,
        },
        {
          ...mockAffectedTransactions[0],
          wac: 2.2,
          totalInventoryQuantity: 210,
        },
        {
          ...mockAffectedTransactions[1],
          wac: 2.2,
          totalInventoryQuantity: 205,
        },
      ]);
    });
  });
});
