import { ITEMS_PER_PAGE } from "@/lib/constant";
import { TransactionRepository } from "@/repo/transaction/transaction_repo";
import PaginationMenu from "@/ui/pagination/pagination_menu";
import { PurchasesTable } from "../ui/purchases-table";

export default async function PurchasesPaginatedTable({
  page,
}: {
  page: number;
}) {
  const transactionRepository = new TransactionRepository();

  const [purchases, totalCount] = await Promise.all([
    transactionRepository.findAll({
      page: page - 1,
      limit: ITEMS_PER_PAGE,
      type: "PURCHASE",
    }),
    transactionRepository.getTotalCount("PURCHASE"),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <>
      <PurchasesTable transactions={purchases} />
      <PaginationMenu page={page} totalPages={totalPages} href="/purchases" />
    </>
  );
}
