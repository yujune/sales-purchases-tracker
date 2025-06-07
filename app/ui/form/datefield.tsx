import { Control, Path } from "react-hook-form";
import { DatePicker } from "../datetime/date-picker";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";

export default function DateField<T extends { date: Date }>({
  control,
  description,
}: {
  control: Control<T>;
  description?: string;
}) {
  return (
    <FormField
      control={control}
      name={"date" as Path<T>}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Purchase Date</FormLabel>
          <FormControl>
            <DatePicker date={field.value} onSelect={field.onChange} />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
