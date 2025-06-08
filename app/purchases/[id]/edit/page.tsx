import { TransactionRepository } from "@/app/data/repo/transaction/transaction_repo";
import Empty from "@/app/ui/empty";
import HeaderNav from "@/app/ui/headernav/headernav";
import { AddPurchaseForm } from "../../new/ui/add-purchase-form";

export default async function EditPurchasePage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;

  const transactionRepository = new TransactionRepository();

  const transaction = await transactionRepository.getTransactionById(params.id);

  return (
    <div>
      <HeaderNav title="Edit Purchase" />
      {transaction ? <AddPurchaseForm transaction={transaction} /> : <Empty />}
    </div>
  );
}
