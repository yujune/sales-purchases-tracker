import Empty from "@/app/ui/empty";
import { ITEMS_PER_PAGE } from "@/lib/constant";
import { TransactionRepository } from "@/repo/transaction/transaction_repo";
import PaginationMenu from "@/ui/pagination/pagination_menu";
import { PurchasesTable } from "./sales-table";

export default async function SalesPaginatedTable({ page }: { page: number }) {
  const transactionRepository = new TransactionRepository();

  const [sales, totalCount] = await Promise.all([
    transactionRepository.findAll({
      page: page - 1,
      limit: ITEMS_PER_PAGE,
      type: "SALE",
    }),
    transactionRepository.getTotalCount("SALE"),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <>
      {totalPages == 0 ? <Empty /> : <PurchasesTable transactions={sales} />}
      <PaginationMenu page={page} totalPages={totalPages} href="/sales" />
    </>
  );
}
