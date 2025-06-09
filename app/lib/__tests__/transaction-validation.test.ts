import { TransactionRepository } from "@/data/repo/transaction/transaction_repo";
import { checkSameDateTransactionExists } from "../transaction-validation";

// Mock the TransactionRepository
jest.mock("@/data/repo/transaction/transaction_repo");

describe("Transaction Validation", () => {
  let mockGetTransactionByDate: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup the mock implementation
    mockGetTransactionByDate = jest.fn();
    (TransactionRepository as jest.Mock).mockImplementation(() => ({
      getTransactionByDate: mockGetTransactionByDate,
    }));
  });

  it("should throw an error when a transaction exists on the same date", async () => {
    const testDate = new Date("2024-03-20");
    mockGetTransactionByDate.mockResolvedValue({ id: 1, date: testDate });

    await expect(checkSameDateTransactionExists(testDate)).rejects.toThrow(
      "Only 1 transaction per day is allowed, please try again with a different date"
    );
    expect(mockGetTransactionByDate).toHaveBeenCalledWith(testDate);
  });

  it("should not throw an error when no transaction exists on the same date", async () => {
    const testDate = new Date("2024-03-20");
    mockGetTransactionByDate.mockResolvedValue(null);

    await expect(
      checkSameDateTransactionExists(testDate)
    ).resolves.not.toThrow();
    expect(mockGetTransactionByDate).toHaveBeenCalledWith(testDate);
  });
});
