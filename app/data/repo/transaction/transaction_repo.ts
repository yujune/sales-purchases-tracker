import {
  Transaction,
  transactions,
  TransactionType,
} from "@/app/data/database/entities/transaction";
import { db } from "@/database/db";
import { count, desc, eq } from "drizzle-orm";

export class TransactionRepository {
  async findAll(params: {
    page: number;
    limit: number;
    type: TransactionType;
  }): Promise<Transaction[]> {
    const { page, limit, type } = params;

    return await db
      .select()
      .from(transactions)
      .orderBy(desc(transactions.createdAt))
      .where(eq(transactions.type, type))
      .limit(limit)
      .offset(page * limit);
  }

  async getTotalCount(type: TransactionType): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(transactions)
      .where(eq(transactions.type, type));
    return result[0].count;
  }
}
