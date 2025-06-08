import { Transaction } from "@/app/data/database/entities/transaction";
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
          <TableHead>Quantity</TableHead>
          <TableHead>Unit Price</TableHead>
          <TableHead>WAC (Average Cost)</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Total Amount</TableHead>
          <TableHead>Total Cost</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell>{transaction.quantity}</TableCell>
            <TableCell>${transaction.unitPrice.toFixed(2)}</TableCell>
            <TableCell>${transaction.wac.toFixed(2)}</TableCell>
            <TableCell>
              {transaction.createdAt
                ? new Date(transaction.createdAt).toLocaleDateString()
                : "N/A"}
            </TableCell>
            <TableCell>
              ${(transaction.quantity * transaction.unitPrice).toFixed(2)}
            </TableCell>
            <TableCell>
              ${(transaction.quantity * transaction.wac).toFixed(2)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
