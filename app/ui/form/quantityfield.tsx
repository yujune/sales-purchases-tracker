import { FormDescription, FormMessage } from "./form";

import { FormControl, FormItem, FormLabel } from "./form";

import { Control, Path } from "react-hook-form";
import { FormField } from "./form";
import { Input } from "./input";

export default function QuantityField<T extends { quantity: number }>({
  control,
  description,
}: {
  control: Control<T>;
  description?: string;
}) {
  return (
    <FormField
      control={control}
      name={"quantity" as Path<T>}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Quantity</FormLabel>
          <FormControl>
            <Input
              type="number"
              min={1}
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
