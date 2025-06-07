import { Control, Path } from "react-hook-form";
import { FormDescription, FormMessage } from "./form";

import { FormControl, FormItem, FormLabel } from "./form";

import { FormField } from "./form";
import { Input } from "./input";

export default function UnitPriceField<T extends { unitPrice: number }>({
  control,
  description,
}: {
  control: Control<T>;
  description?: string;
}) {
  return (
    <FormField
      control={control}
      name={"unitPrice" as Path<T>}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Unit Price</FormLabel>
          <FormControl>
            <Input
              type="number"
              min={0}
              step="1"
              {...field}
              onChange={(e) => {
                const value = e.target.value;
                field.onChange(value === "" ? 0 : Number(value));
              }}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
