"use server";

import { NewTransaction } from "@/app/data/database/entities";
import { TransactionRepository } from "@/app/data/repo/transaction/transaction_repo";

export async function createSale(transaction: NewTransaction) {
  const transactionRepository = new TransactionRepository();
  return await transactionRepository.create(transaction);
}
