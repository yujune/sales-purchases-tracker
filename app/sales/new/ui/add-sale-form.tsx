"use client";

import { NewTransaction } from "@/app/data/database/entities";
import { Button } from "@/app/ui/button";
import ErrorDialog from "@/app/ui/dialog/error-dialog";
import DateField from "@/app/ui/form/datefield";
import { Form } from "@/app/ui/form/form";
import QuantityField from "@/app/ui/form/quantityfield";
import UnitPriceField from "@/app/ui/form/unitpricefield";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createSale } from "../actions";

const saleFormSchema = z.object({
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
  date: z.date(),
});

type SaleFormModel = z.infer<typeof saleFormSchema>;

export function AddSaleForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<SaleFormModel>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      quantity: 1,
      unitPrice: 1,
      date: new Date(),
    },
  });

  async function onSubmit(values: SaleFormModel) {
    try {
      setIsSubmitting(true);
      setError(null);
      const transaction: NewTransaction = {
        quantity: values.quantity,
        unitPrice: values.unitPrice,
        type: "SALE",
        wac: values.unitPrice,
        totalInventoryQuantity: values.quantity,
        createdAt: values.date,
      };
      await createSale(transaction);
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
                Adding...
              </>
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
