import HeaderNav from "@/app/ui/headernav/headernav";
import { AddPurchaseForm } from "./ui/add-purchase-form";

export default function NewPurchasePage() {
  return (
    <div>
      <HeaderNav title="New Purchase" />
      <AddPurchaseForm />
    </div>
  );
}
