"use server";

import {
  BaseNewTransaction,
  upsertCurrentAndRecalculateAffectedTransactions,
} from "@/app/lib/transaction-calculation";
import { checkSameDateTransactionExists } from "@/app/lib/transaction-validation";
export async function createPurchase(transaction: BaseNewTransaction) {
  await checkSameDateTransactionExists(transaction.createdAt);

  await upsertCurrentAndRecalculateAffectedTransactions(transaction);
}
