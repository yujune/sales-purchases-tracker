import { TransactionRepository } from "@/app/data/repo/transaction/transaction_repo";
import Empty from "@/app/ui/empty";
import HeaderNav from "@/app/ui/headernav/headernav";
import { AddSaleForm } from "../../new/ui/add-sale-form";

export default async function EditSalePage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;

  const transactionRepository = new TransactionRepository();

  const transaction = await transactionRepository.getTransactionById(params.id);

  return (
    <div>
      <HeaderNav title="Edit Sale" />
      {transaction ? <AddSaleForm transaction={transaction} /> : <Empty />}
    </div>
  );
}
