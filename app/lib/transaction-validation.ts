import { TransactionRepository } from "@/data/repo/transaction/transaction_repo";

export const checkSameDateTransactionExists = async (transactionDate: Date) => {
  const transactionRepository = new TransactionRepository();

  const sameDateTransaction = await transactionRepository.getTransactionByDate(
    transactionDate
  );

  if (!!sameDateTransaction) {
    throw new Error(
      "Only 1 transaction per day is allowed, please try again with a different date"
    );
  }
};
