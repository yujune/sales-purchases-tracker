"use client";

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
import { createPurchase, NewPurchaseTransaction } from "../actions";

const purchaseFormSchema = z.object({
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
  date: z.date(),
});

type PurchaseFormModel = z.infer<typeof purchaseFormSchema>;

export function AddPurchaseForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const form = useForm<PurchaseFormModel>({
    resolver: zodResolver(purchaseFormSchema),
    defaultValues: {
      quantity: 1,
      unitPrice: 1,
      date: new Date(),
    },
  });

  async function onSubmit(values: PurchaseFormModel) {
    try {
      setIsSubmitting(true);
      setError(null);
      const transaction: NewPurchaseTransaction = {
        quantity: values.quantity,
        unitPrice: values.unitPrice,
        date: values.date,
      };
      await createPurchase(transaction);
      toast.success("Purchase created successfully");
      router.replace("/purchases");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create purchase"
      );
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
            description="Enter the number of items purchased."
          />
          <UnitPriceField
            control={form.control}
            description="Enter the price per unit."
          />
          <DateField
            control={form.control}
            description="Select the date of purchase."
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Purchase"
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
