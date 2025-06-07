import {
  doublePrecision,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const transactions = pgTable("Transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  quantity: integer("quantity").notNull(),
  unitPrice: doublePrecision("unitPrice").notNull(),
  type: text({ enum: ["PURCHASE", "SALE"] }).notNull(),
  wac: doublePrecision("wac").notNull(),
  totalInventoryQuantity: integer("totalInventoryQuantity").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type NewTransaction = typeof transactions.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type TransactionType = "PURCHASE" | "SALE";
