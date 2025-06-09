import { calculateWacAndTotalInventoryQuantity } from "@/app/lib/transaction-calculation";
import { Transaction } from "@/data/database/entities";
import { TransactionRepository } from "@/data/repo/transaction/transaction_repo";
import { getAffectedTransactionsAndRecalculate } from "../delete-actions";

jest.mock("@/data/repo/transaction/transaction_repo");

jest.mock("@/app/lib/transaction-calculation", () => ({
  calculateWacAndTotalInventoryQuantity: jest.fn(),
}));

describe("delete-actions", () => {
  let mockTransactionRepository: jest.Mocked<TransactionRepository>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockTransactionRepository = {
      findAll: jest.fn(),
      getLatestTransaction: jest.fn(),
      deleteAndUpdateTransactions: jest.fn(),
    } as unknown as jest.Mocked<TransactionRepository>;

    // Mock the constructor
    (TransactionRepository as jest.Mock).mockImplementation(
      () => mockTransactionRepository
    );
  });

  describe("getAffectedTransactionsAndRecalculate", () => {
    it("should handle deletion of a transaction and recalculate WAC for all affected transactions", async () => {
      // Example scenario from project description:
      // 1. First purchase: 150 items at RM2 each on 01/01/2022
      // 2. Second purchase: 10 items at RM1.50 each on 05/01/2022
      // 3. Sale: 5 items on 07/01/2022

      // Mock the transaction to be deleted (second purchase)
      const mockAffectingTransaction: Transaction = {
        id: "2",
        type: "PURCHASE",
        quantity: 10,
        unitPrice: 1.5,
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

      // Mock the last transaction before the deleted one (first purchase)
      const mockLastTransaction: Transaction = {
        id: "1",
        type: "PURCHASE",
        quantity: 150,
        unitPrice: 2.0,
        wac: 2.0,
        totalInventoryQuantity: 150,
        createdAt: new Date("2022-01-01"),
      };

      // Setup mock implementations
      mockTransactionRepository.findAll.mockResolvedValue(
        mockAffectedTransactions
      );
      mockTransactionRepository.getLatestTransaction.mockResolvedValue(
        mockLastTransaction
      );

      // Mock calculateWacAndTotalInventoryQuantity to return recalculated values
      // After deleting the second purchase, the sale should be recalculated based on first purchase only
      (
        calculateWacAndTotalInventoryQuantity as jest.Mock
      ).mockImplementationOnce(() => ({
        wac: 2.0, // WAC should revert to RM2.00 since second purchase is deleted
        totalInventoryQuantity: 145, // 150 - 5 = 145
      }));

      const result = await getAffectedTransactionsAndRecalculate({
        affectingTransaction: mockAffectingTransaction,
      });

      expect(mockTransactionRepository.findAll).toHaveBeenCalledWith({
        fromDate: mockAffectingTransaction.createdAt,
      });
      expect(
        mockTransactionRepository.getLatestTransaction
      ).toHaveBeenCalledWith({
        byDate: mockAffectingTransaction.createdAt,
      });

      expect(calculateWacAndTotalInventoryQuantity).toHaveBeenCalledWith(
        mockLastTransaction,
        {
          quantity: mockAffectedTransactions[0].quantity,
          unitPrice: mockAffectedTransactions[0].unitPrice,
          date: mockAffectedTransactions[0].createdAt,
          type: mockAffectedTransactions[0].type,
        }
      );

      expect(result).toHaveLength(1);
      expect(result[0].wac).toBeCloseTo(2.0, 2); // WAC should be RM2.00
      expect(result[0].totalInventoryQuantity).toBe(145); // 150 - 5 = 145
    });

    it("should handle deletion of the first transaction and recalculate all subsequent transactions", async () => {
      // Mock the transaction to be deleted (first purchase)
      const mockAffectingTransaction: Transaction = {
        id: "1",
        type: "PURCHASE",
        quantity: 150,
        unitPrice: 2.0,
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

      // Mock the last transaction (should be null since we're deleting the first transaction)
      const mockLastTransaction = null;

      // Setup mock implementations
      mockTransactionRepository.findAll.mockResolvedValue(
        mockAffectedTransactions
      );
      mockTransactionRepository.getLatestTransaction.mockResolvedValue(
        mockLastTransaction
      );

      // Mock calculateWacAndTotalInventoryQuantity for each transaction
      (calculateWacAndTotalInventoryQuantity as jest.Mock)
        .mockImplementationOnce(() => ({
          wac: 1.5, // Only second purchase exists
          totalInventoryQuantity: 10,
        }))
        .mockImplementationOnce(() => ({
          wac: 1.5, // WAC remains same after sale
          totalInventoryQuantity: 5,
        }));

      const result = await getAffectedTransactionsAndRecalculate({
        affectingTransaction: mockAffectingTransaction,
      });

      expect(result).toHaveLength(2);

      // First transaction (second purchase)
      expect(result[0].wac).toBeCloseTo(1.5, 2); // WAC should be RM1.50
      expect(result[0].totalInventoryQuantity).toBe(10);

      // Second transaction (sale)
      expect(result[1].wac).toBeCloseTo(1.5, 2); // WAC should remain RM1.50
      expect(result[1].totalInventoryQuantity).toBe(5);
    });
  });
});
