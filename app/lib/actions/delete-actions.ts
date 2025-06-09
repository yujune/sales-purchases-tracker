"use server";

import { NewTransaction, Transaction } from "@/app/data/database/entities";
import { calculateWacAndTotalInventoryQuantity } from "@/app/lib/transaction-calculation";
import { TransactionRepository } from "@/data/repo/transaction/transaction_repo";

// Recalculate all transactions wac and total inventory quantity from a given date, and return the db model for new transactions.
// param: affectingTransaction is the new transaction that affect all the wac and total inventory quantity after it.
export async function getAffectedTransactionsAndRecalculate(params: {
  affectingTransaction: Transaction;
}): Promise<NewTransaction[]> {
  const { affectingTransaction } = params;

  const transactionRepository = new TransactionRepository();

  //This won't include the purchase to be deleted. Get all transactions greater than the purchase to be deleted.
  const affectedTransactions = await transactionRepository.findAll({
    fromDate: affectingTransaction.createdAt!,
  });

  const newTransactions: Transaction[] = [];

  //Recalculate from the last purchase before the purchase to be deleted.
  let lastTransaction = await transactionRepository.getLatestTransaction({
    byDate: affectingTransaction.createdAt!,
  });

  for (const affectedTransaction of affectedTransactions) {
    const { wac, totalInventoryQuantity } =
      calculateWacAndTotalInventoryQuantity(lastTransaction, {
        quantity: affectedTransaction.quantity,
        unitPrice: affectedTransaction.unitPrice,
        date: affectedTransaction.createdAt!,
        type: affectedTransaction.type,
      });

    const newAffectedTransaction = {
      ...affectedTransaction,
      wac,
      totalInventoryQuantity,
    };

    lastTransaction = newAffectedTransaction;

    newTransactions.push(newAffectedTransaction);
  }

  return newTransactions;
}

export async function deleteTransaction(transaction: Transaction) {
  const newAffectedTransactions = await getAffectedTransactionsAndRecalculate({
    affectingTransaction: transaction,
  });

  const transactionRepository = new TransactionRepository();

  await transactionRepository.deleteAndUpdateTransactions(
    transaction,
    newAffectedTransactions
  );
}
