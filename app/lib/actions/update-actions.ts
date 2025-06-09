"use server";

import { Transaction } from "@/app/data/database/entities";
import { upsertCurrentAndRecalculateAffectedTransactions } from "../transaction-calculation";

export async function updateTransaction(transaction: Transaction) {
  await upsertCurrentAndRecalculateAffectedTransactions({
    id: transaction.id,
    quantity: transaction.quantity,
    unitPrice: transaction.unitPrice,
    createdAt: transaction.createdAt!,
    type: transaction.type,
  });
}
