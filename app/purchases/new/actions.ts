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

export async function createPurchase(transaction: NewPurchaseTransaction) {
  await checkSameDateTransactionExists(transaction.date);

  const transactionRepository = new TransactionRepository();
  const latestPurchase = await transactionRepository.getLatestTransaction(
    "PURCHASE"
  );

  let wac = transaction.unitPrice;
  let totalInventoryQuantity = transaction.quantity;

  if (!!latestPurchase) {
    wac = calculateNewWac(latestPurchase, transaction);
    totalInventoryQuantity =
      latestPurchase.totalInventoryQuantity + transaction.quantity;
  }

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
