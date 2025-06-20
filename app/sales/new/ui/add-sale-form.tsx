"use client";

import { Transaction } from "@/app/data/database/entities/transaction";
import { updateTransaction } from "@/app/lib/actions/update-actions";
import { BaseNewTransaction } from "@/app/lib/transaction-calculation";
import { Button } from "@/app/ui/button";
import ErrorDialog from "@/app/ui/dialog/error-dialog";
import DateField from "@/app/ui/form/datefield";
import { Form } from "@/app/ui/form/form";
import QuantityField from "@/app/ui/form/quantityfield";
import UnitPriceField from "@/app/ui/form/unitpricefield";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createSale } from "../add-actions";

const saleFormSchema = z.object({
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
  createdAt: z.date(),
});

type SaleFormModel = z.infer<typeof saleFormSchema>;

export function AddSaleForm({ transaction }: { transaction?: Transaction }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const form = useForm<SaleFormModel>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      quantity: transaction?.quantity ?? 1,
      unitPrice: transaction?.unitPrice ?? 1,
      createdAt: transaction?.createdAt ?? new Date(),
    },
  });

  async function onSubmit(values: SaleFormModel) {
    try {
      setIsSubmitting(true);
      setError(null);

      if (transaction) {
        const updatedTransaction: Transaction = {
          ...transaction,
          quantity: values.quantity,
          unitPrice: values.unitPrice,
          createdAt: values.createdAt,
          type: "SALE",
        };
        await updateTransaction(updatedTransaction);
        toast.success("Sale updated successfully");
      } else {
        const transaction: BaseNewTransaction = {
          quantity: values.quantity,
          unitPrice: values.unitPrice,
          createdAt: values.createdAt,
          type: "SALE",
        };
        await createSale(transaction);
        toast.success("Sale created successfully");
      }
      router.replace("/sales");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create sale");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mx-auto max-w-xl space-y-6 my-12"
        >
          <QuantityField
            control={form.control}
            description="Enter the number of items sold."
          />
          <UnitPriceField
            control={form.control}
            description="Enter the price per unit."
          />
          <DateField
            control={form.control}
            description="Select the date of sale."
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {transaction ? "Updating..." : "Adding..."}
              </>
            ) : transaction ? (
              "Update Sale"
            ) : (
              "Add Sale"
            )}
          </Button>
        </form>
      </Form>

      <ErrorDialog
        open={!!error}
        onOpenChange={() => setError(null)}
        errorMessage={error}
      />
    </>
  );
}
