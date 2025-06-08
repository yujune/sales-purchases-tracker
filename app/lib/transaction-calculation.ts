import { NewTransaction, TransactionType } from "../data/database/entities";
import { toDecimal } from "./utils";

//application model for new transaction, consists all the values getting from ui form.
export interface BaseNewTransaction {
  quantity: number;
  unitPrice: number;
  date: Date;
  type: TransactionType;
}

//calculate new transaction wac and total inventory quantity based on the last transaction and the new transaction
//and return the db model for new transaction.
export function constructNewTransaction(
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
    type: transaction.type,
    wac: toDecimal({ value: wac, decimals: 2 }),
    totalInventoryQuantity: totalInventoryQuantity,
    createdAt: transaction.date,
  };

  return newTransaction;
}

// Calculate new WAC based on the previous purchase transaction and the current transaction
// New WAC = (Total Inventory Value + Current Transaction Value) / (Total Inventory Quantity + Current Transaction Quantity)
export function calculateNewWac(
  lastPurchase: NewTransaction,
  currentTransaction: BaseNewTransaction
): number {
  const isSale = currentTransaction.type === "SALE";

  if (isSale) {
    //SALE won't affect average cost, so return the previous transaction's wac.
    return lastPurchase.wac;
  }

  const newTotalInventoryQuantity = calculateNewTotalInventoryQuantity(
    lastPurchase,
    currentTransaction
  );

  const newTotalInventoryValue = calculateNewTotalInventoryValue(
    lastPurchase,
    currentTransaction
  );

  return newTotalInventoryValue / newTotalInventoryQuantity;
}

// Calculate new total inventory value based on the previous purchase transaction and the current transaction
// New Total Inventory Value =  Total Inventory Quantity * WAC + Current Transaction Quantity * Current Unit Price
function calculateNewTotalInventoryValue(
  lastPurchase: NewTransaction,
  currentTransaction: BaseNewTransaction
): number {
  const totalInventoryValue =
    lastPurchase.totalInventoryQuantity * lastPurchase.wac;

  return (
    totalInventoryValue +
    currentTransaction.quantity * currentTransaction.unitPrice
  );
}

// Calculate new total inventory quantity based on the previous purchase transaction and the current transaction
// New Total Inventory Quantity = Total Inventory Quantity + Current Transaction Quantity
// If it is sale transaction, the new total inventory quantity is total inventory quantity - current transaction quantity
export function calculateNewTotalInventoryQuantity(
  lastPurchase: NewTransaction,
  currentTransaction: BaseNewTransaction
): number {
  const isPurchase = currentTransaction.type === "PURCHASE";

  return isPurchase
    ? lastPurchase.totalInventoryQuantity + currentTransaction.quantity
    : lastPurchase.totalInventoryQuantity - currentTransaction.quantity;
}

// Calculate new WAC and total inventory quantity based on the previous purchase transaction and the current transaction
// If there is no previous purchase, the new WAC and total inventory quantity are the same as the current transaction
export function calculateWacAndTotalInventoryQuantity(
  lastPurchase: NewTransaction | null,
  currentTransaction: BaseNewTransaction
): { wac: number; totalInventoryQuantity: number } {
  let wac = currentTransaction.unitPrice;
  let totalInventoryQuantity = currentTransaction.quantity;

  const hasPreviousTransaction = !!lastPurchase;

  if (hasPreviousTransaction) {
    wac = calculateNewWac(lastPurchase, currentTransaction);

    totalInventoryQuantity = calculateNewTotalInventoryQuantity(
      lastPurchase,
      currentTransaction
    );
  }

  return { wac, totalInventoryQuantity };
}
