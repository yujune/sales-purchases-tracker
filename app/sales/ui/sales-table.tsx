import { Transaction } from "@/app/data/database/entities/transaction";
import { formatDate } from "@/app/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table";

interface PurchasesTableProps {
  transactions: Transaction[];
}

export function PurchasesTable({ transactions }: PurchasesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Unit Price</TableHead>
          <TableHead>WAC (Average Cost)</TableHead>
          <TableHead>Total Sale Amount</TableHead>
          <TableHead>Total Cost</TableHead>
          <TableHead>Date</TableHead>
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
              ${(transaction.quantity * transaction.unitPrice).toFixed(2)}
            </TableCell>
            <TableCell>
              ${(transaction.quantity * transaction.wac).toFixed(2)}
            </TableCell>
            <TableCell>
              {formatDate(
                transaction.createdAt ? new Date(transaction.createdAt) : null
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
