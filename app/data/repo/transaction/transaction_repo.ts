import {
  NewTransaction,
  Transaction,
  transactions,
  TransactionType,
} from "@/app/data/database/entities/transaction";
import { db } from "@/database/db";
import { and, asc, count, desc, eq, gt, lt, or, sql } from "drizzle-orm";

export class TransactionRepository {
  async findAll(params: {
    page?: number;
    limit?: number;
    type?: TransactionType;
    fromDate?: Date;
    byDate?: Date;
  }): Promise<Transaction[]> {
    const { page, limit, type, fromDate, byDate } = params;

    const query = db
      .select()
      .from(transactions)
      .orderBy(
        !!fromDate ? asc(transactions.createdAt) : desc(transactions.createdAt)
      )
      .where(
        and(
          !!type ? eq(transactions.type, type) : undefined,
          or(
            !!fromDate ? gt(transactions.createdAt, fromDate) : undefined,
            !!byDate ? lt(transactions.createdAt, byDate) : undefined
          )
        )
      );

    if (!!limit) {
      query.limit(limit);
    }

    if (!!page && !!limit) {
      query.offset(page * limit);
    }

    return await query;
  }

  async getTransactionById(id: string): Promise<Transaction | null> {
    const result = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id));
    return result.length > 0 ? result[0] : null;
  }

  async getTotalCount(type: TransactionType): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(transactions)
      .where(eq(transactions.type, type));
    return result[0].count;
  }

  async getTransactionByDate(date: Date): Promise<Transaction | null> {
    const result = await db
      .select()
      .from(transactions)
      .where(eq(transactions.createdAt, date));
    return result.length > 0 ? result[0] : null;
  }

  async getLatestTransaction(
    type?: TransactionType,
    byDate?: Date
  ): Promise<Transaction | null> {
    const result = await db
      .select()
      .from(transactions)
      .where(
        and(
          !!type ? eq(transactions.type, type) : undefined,
          !!byDate ? lt(transactions.createdAt, byDate) : undefined
        )
      )
      .orderBy(desc(transactions.createdAt))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  }

  async create(transaction: NewTransaction): Promise<Transaction> {
    const [result] = await db
      .insert(transactions)
      .values(transaction)
      .returning();

    return result;
  }

  async updateExistingTransactions(
    newTransactions: NewTransaction[]
  ): Promise<Transaction[]> {
    const result = await db
      .insert(transactions)
      .values(newTransactions)
      .onConflictDoUpdate({
        target: [transactions.id],
        set: {
          quantity: sql`excluded.quantity`,
          unitPrice: sql`excluded."unitPrice"`,
          createdAt: sql`excluded."createdAt"`,
          wac: sql`excluded."wac"`,
          totalInventoryQuantity: sql`excluded."totalInventoryQuantity"`,
        },
      });

    return result;
  }

  async deleteAndUpdateTransactions(
    transactionToDelete: Transaction,
    newTransactions: NewTransaction[]
  ): Promise<void> {
    await db.transaction(async (tx) => {
      await tx
        .delete(transactions)
        .where(eq(transactions.id, transactionToDelete.id));

      if (newTransactions.length > 0) {
        await tx
          .insert(transactions)
          .values(newTransactions)
          .onConflictDoUpdate({
            target: [transactions.id],
            set: {
              wac: sql`excluded.wac`,
              totalInventoryQuantity: sql`excluded."totalInventoryQuantity"`,
            },
          });
      }
    });
  }
}
