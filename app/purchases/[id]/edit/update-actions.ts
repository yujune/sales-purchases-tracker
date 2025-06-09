"use server";

import { NewTransaction, Transaction } from "@/app/data/database/entities";
import { TransactionRepository } from "@/app/data/repo/transaction/transaction_repo";
import { calculateWacAndTotalInventoryQuantity } from "@/app/lib/transaction-calculation";

// Recalculate all transactions wac and total inventory quantity from a given date, and return the db model for new transactions.
// param: affectingTransaction is the new transaction that affect all the wac and total inventory quantity after it.
async function getAffectedTransactionsAndRecalculate(params: {
  affectingTransaction: Transaction;
}): Promise<NewTransaction[]> {
  const { affectingTransaction } = params;

  const transactionRepository = new TransactionRepository();

  const affectedTransactions = await transactionRepository.findAll({
    fromDate: affectingTransaction.createdAt!,
  });

  const newTransactions: Transaction[] = [];

  let lastTransaction = affectingTransaction;

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

export async function updateTransaction(transaction: Transaction) {
  const transactionRepository = new TransactionRepository();

  const lastTransaction = await transactionRepository.getLatestTransaction({
    byDate: transaction.createdAt!,
  });

  //Construct new transaction with new wac and total inventory quantity.
  const { wac, totalInventoryQuantity } = calculateWacAndTotalInventoryQuantity(
    lastTransaction,
    {
      quantity: transaction.quantity,
      unitPrice: transaction.unitPrice,
      date: transaction.createdAt!,
      type: transaction.type,
    }
  );

  const updatedTransaction = {
    ...transaction,
    wac,
    totalInventoryQuantity,
  };

  const newAffectedTransactions = await getAffectedTransactionsAndRecalculate({
    affectingTransaction: updatedTransaction,
  });

  await transactionRepository.updateExistingTransactions([
    updatedTransaction,
    ...newAffectedTransactions,
  ]);
}
