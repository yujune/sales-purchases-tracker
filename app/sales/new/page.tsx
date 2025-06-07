import HeaderNav from "@/app/ui/headernav/headernav";
import { AddSaleForm } from "./ui/add-sale-form";

export default function NewPurchasePage() {
  return (
    <div>
      <HeaderNav title="New Sale" />
      <AddSaleForm />
    </div>
  );
}
