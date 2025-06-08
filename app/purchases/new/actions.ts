"use server";

import { NewTransaction, Transaction } from "@/app/data/database/entities";
import { TransactionRepository } from "@/app/data/repo/transaction/transaction_repo";
import { checkSameDateTransactionExists } from "@/app/lib/transaction-validation";
import { toDecimal } from "@/app/lib/utils";

export interface NewPurchaseTransaction {
  quantity: number;
  unitPrice: number;
  date: Date;
}

// Calculate new WAC based on the previous purchase and the new purchase
function calculateNewWac(
  latestPurchase: Transaction,
  newPurchase: NewPurchaseTransaction
) {
  const totalInventoryValue =
    latestPurchase.totalInventoryQuantity * latestPurchase.wac;

  const totalNewPurchaseValue = newPurchase.unitPrice * newPurchase.quantity;

  const newTotalInventoryQuantity =
    latestPurchase.totalInventoryQuantity + newPurchase.quantity;

  return (
    (totalInventoryValue + totalNewPurchaseValue) / newTotalInventoryQuantity
  );
}

// Calculate new WAC and total inventory quantity based on the previous purchase and the new purchase
// If there is no previous purchase, the new WAC and total inventory quantity are the same as the new purchase
async function calculateWacAndTotalInventoryQuantity(
  latestPurchase: Transaction | null,
  newTransaction: NewPurchaseTransaction
): Promise<{ wac: number; totalInventoryQuantity: number }> {
  let wac = newTransaction.unitPrice;
  let totalInventoryQuantity = newTransaction.quantity;

  const hasPreviousPurchase = !!latestPurchase;

  if (hasPreviousPurchase) {
    wac = calculateNewWac(latestPurchase, newTransaction);
    totalInventoryQuantity =
      latestPurchase.totalInventoryQuantity + newTransaction.quantity;
  }

  return { wac, totalInventoryQuantity };
}

export async function createPurchase(transaction: NewPurchaseTransaction) {
  await checkSameDateTransactionExists(transaction.date);

  const transactionRepository = new TransactionRepository();
  const latestPurchase = await transactionRepository.getLatestTransaction(
    "PURCHASE"
  );

  const { wac, totalInventoryQuantity } =
    await calculateWacAndTotalInventoryQuantity(latestPurchase, transaction);

  const newTransaction: NewTransaction = {
    quantity: transaction.quantity,
    unitPrice: toDecimal({ value: transaction.unitPrice, decimals: 2 }),
    type: "PURCHASE",
    wac: toDecimal({ value: wac, decimals: 2 }),
    totalInventoryQuantity: totalInventoryQuantity,
    createdAt: transaction.date,
  };

  return await transactionRepository.create(newTransaction);
}
