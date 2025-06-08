"use server";

import { NewTransaction } from "@/app/data/database/entities";
import { TransactionRepository } from "@/app/data/repo/transaction/transaction_repo";
import {
  BaseNewTransaction,
  calculateWacAndTotalInventoryQuantity,
  constructNewTransaction,
} from "@/app/lib/transaction-calculation";
import { checkSameDateTransactionExists } from "@/app/lib/transaction-validation";

// Recalculate all transactions wac and total inventory quantity from a given date, and return the db model for new transactions.
// param: affectingTransaction is the new transaction that affect all the wac and total inventory quantity after it.
async function getAffectedTransactionsAndRecalculate(params: {
  affectingTransaction: NewTransaction;
}): Promise<NewTransaction[]> {
  const { affectingTransaction } = params;

  const transactionRepository = new TransactionRepository();

  const affectedTransactions = await transactionRepository.findAll({
    fromDate: affectingTransaction.createdAt!,
  });

  let previousTransaction = affectingTransaction;

  const newTransactions: NewTransaction[] = [];

  for (const affectedTransaction of affectedTransactions) {
    const { wac, totalInventoryQuantity } =
      calculateWacAndTotalInventoryQuantity(previousTransaction, {
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

    newTransactions.push(newAffectedTransaction);

    previousTransaction = newAffectedTransaction;
  }

  return newTransactions;
}

//Recalculate all the affected transactions and update the db.
//if no affected transactions, just create a new transaction.
async function recalculateAffectedTransactionsAndUpdateDb(
  transaction: BaseNewTransaction
) {
  const transactionRepository = new TransactionRepository();

  const previousPurchaseBeforeNewPurchase =
    await transactionRepository.getLatestTransaction({
      byDate: transaction.date,
    });

  const newTransaction = constructNewTransaction(
    previousPurchaseBeforeNewPurchase,
    transaction
  );

  const newAffectedTransactions = await getAffectedTransactionsAndRecalculate({
    affectingTransaction: newTransaction,
  });

  await transactionRepository.updateExistingTransactions([
    newTransaction,
    ...newAffectedTransactions,
  ]);
}

export async function createPurchase(transaction: BaseNewTransaction) {
  await checkSameDateTransactionExists(transaction.date);

  await recalculateAffectedTransactionsAndUpdateDb(transaction);
}
