"use client";

import { Transaction } from "@/app/data/database/entities/transaction";
import { formatDate } from "@/app/lib/utils";
import { Button } from "@/app/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteTransaction } from "../../lib/actions/delete-actions";

interface PurchasesTableProps {
  transactions: Transaction[];
}

export function PurchasesTable({ transactions }: PurchasesTableProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = (transaction: Transaction) => {
    startTransition(async () => {
      try {
        await deleteTransaction(transaction);
        toast.success("Purchase deleted successfully");
        router.refresh();
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete purchase";
        toast.error(errorMessage);
      }
    });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Unit Price</TableHead>
          <TableHead>WAC (Average Cost)</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell>{transaction.id}</TableCell>
            <TableCell>{transaction.quantity}</TableCell>
            <TableCell>${transaction.unitPrice.toFixed(2)}</TableCell>
            <TableCell>${transaction.wac.toFixed(2)}</TableCell>
            <TableCell>
              {formatDate(
                transaction.createdAt ? new Date(transaction.createdAt) : null
              )}
            </TableCell>
            <TableCell>
              <Button
                className="mr-3"
                variant="outline"
                size="icon"
                onClick={() => router.push(`/purchases/${transaction.id}/edit`)}
                disabled={isPending}
              >
                <PencilIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => handleDelete(transaction)}
                disabled={isPending}
              >
                <Trash2Icon className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
