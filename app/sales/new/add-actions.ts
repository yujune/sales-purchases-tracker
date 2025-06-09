"use server";

import { TransactionRepository } from "@/app/data/repo/transaction/transaction_repo";
import {
  BaseNewTransaction,
  upsertCurrentAndRecalculateAffectedTransactions,
} from "@/app/lib/transaction-calculation";
import { checkSameDateTransactionExists } from "@/app/lib/transaction-validation";

export async function createSale(transaction: BaseNewTransaction) {
  await checkSameDateTransactionExists(transaction.createdAt);

  const transactionRepository = new TransactionRepository();
  const latestTransaction = await transactionRepository.getLatestTransaction();

  if (!latestTransaction) {
    throw new Error("No inventory found, please add a purchase first");
  }

  const latestTotalInventoryQuantity = latestTransaction.totalInventoryQuantity;
  const saleQuantity = transaction.quantity;

  if (latestTotalInventoryQuantity < saleQuantity) {
    const missingQuantity = saleQuantity - latestTotalInventoryQuantity;
    throw new Error(
      `Not enough inventory, please add ${missingQuantity} more items`
    );
  }

  await upsertCurrentAndRecalculateAffectedTransactions(transaction);
}
