"use server";

import { NewTransaction } from "@/app/data/database/entities";
import { TransactionRepository } from "@/app/data/repo/transaction/transaction_repo";
import { checkSameDateTransactionExists } from "@/app/lib/transaction-validation";
import { toDecimal } from "@/app/lib/utils";

export interface NewSaleTransaction {
  quantity: number;
  unitPrice: number;
  date: Date;
}

export async function createSale(transaction: NewSaleTransaction) {
  await checkSameDateTransactionExists(transaction.date);

  const transactionRepository = new TransactionRepository();
  const latestTransaction = await transactionRepository.getLatestTransaction({
    type: "PURCHASE",
  });

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

  const newTotalInventoryQuantity = latestTotalInventoryQuantity - saleQuantity;

  const newTransaction: NewTransaction = {
    quantity: saleQuantity,
    unitPrice: toDecimal({ value: transaction.unitPrice, decimals: 2 }),
    type: "SALE",
    wac: toDecimal({ value: latestTransaction.wac, decimals: 2 }),
    totalInventoryQuantity: newTotalInventoryQuantity,
    createdAt: transaction.date,
  };

  return await transactionRepository.create(newTransaction);
}
