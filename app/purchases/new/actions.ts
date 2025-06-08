"use server";

import { NewTransaction, TransactionType } from "@/app/data/database/entities";
import { TransactionRepository } from "@/app/data/repo/transaction/transaction_repo";
import { checkSameDateTransactionExists } from "@/app/lib/transaction-validation";
import { toDecimal } from "@/app/lib/utils";

//application model for new transaction, consists all the values getting from ui form.
export interface BaseNewTransaction {
  quantity: number;
  unitPrice: number;
  date: Date;
  type: TransactionType;
}

// Calculate new WAC based on the previous purchase and the new purchase
function calculateNewWac(
  latestPurchase: NewTransaction,
  newPurchase: BaseNewTransaction
): number {
  const isSale = newPurchase.type === "SALE";

  if (isSale) {
    //SALE won't affect average cost.
    return latestPurchase.wac;
  }

  const currentTotalInventoryValue =
    latestPurchase.totalInventoryQuantity * latestPurchase.wac;

  const totalNewPurchaseValue = newPurchase.unitPrice * newPurchase.quantity;

  const newTotalInventoryQuantity = calculateNewTotalInventoryQuantity(
    latestPurchase,
    newPurchase
  );

  return (
    (currentTotalInventoryValue + totalNewPurchaseValue) /
    newTotalInventoryQuantity
  );
}

function calculateNewTotalInventoryQuantity(
  lastTransaction: NewTransaction,
  newTransaction: BaseNewTransaction
): number {
  const isPurchase = newTransaction.type === "PURCHASE";

  return isPurchase
    ? lastTransaction.totalInventoryQuantity + newTransaction.quantity
    : lastTransaction.totalInventoryQuantity - newTransaction.quantity;
}

// Calculate new WAC and total inventory quantity based on the previous purchase and the new purchase
// If there is no previous purchase, the new WAC and total inventory quantity are the same as the new purchase
function calculateWacAndTotalInventoryQuantity(
  lastTransaction: NewTransaction | null,
  newTransaction: BaseNewTransaction
): { wac: number; totalInventoryQuantity: number } {
  let wac = newTransaction.unitPrice;
  let totalInventoryQuantity = newTransaction.quantity;

  const hasPreviousTransaction = !!lastTransaction;

  if (hasPreviousTransaction) {
    wac = calculateNewWac(lastTransaction, newTransaction);

    totalInventoryQuantity = calculateNewTotalInventoryQuantity(
      lastTransaction,
      newTransaction
    );
  }

  return { wac, totalInventoryQuantity };
}

//calculate new transaction wac and total inventory quantity based on the last transaction and the new transaction
//and return the db model for new transaction.
function constructNewTransaction(
  lastTransaction: NewTransaction | null,
  transaction: BaseNewTransaction
): NewTransaction {
  const { wac, totalInventoryQuantity } = calculateWacAndTotalInventoryQuantity(
    lastTransaction,
    transaction
  );

  const newTransaction: NewTransaction = {
    quantity: transaction.quantity,
    unitPrice: toDecimal({ value: transaction.unitPrice, decimals: 2 }),
    type: "PURCHASE",
    wac: toDecimal({ value: wac, decimals: 2 }),
    totalInventoryQuantity: totalInventoryQuantity,
    createdAt: transaction.date,
  };

  return newTransaction;
}

// Recalculate all transactions wac and total inventory quantity from a given date, and return the db model for new transactions.
// param: affectingTransaction is the new transaction that affect all the wac and total inventory quantity after it.
async function recalculateAffectedTransactions(params: {
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

//recalculate all the affected transactions and update the db.
//if no affected transactions, create a new transaction.
async function recalculateAffectedTransactionsAndUpdateDb(
  transaction: BaseNewTransaction
) {
  const transactionRepository = new TransactionRepository();

  const previousPurchaseBeforeNewPurchase =
    await transactionRepository.getLatestTransaction(
      "PURCHASE",
      transaction.date
    );

  const newTransaction = constructNewTransaction(
    previousPurchaseBeforeNewPurchase,
    transaction
  );

  const newAffectedTransactions = await recalculateAffectedTransactions({
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
