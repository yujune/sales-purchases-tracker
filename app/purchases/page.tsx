import HeaderNav from "../ui/headernav/headernav";
import PurchasesPaginatedTable from "./ui/purchases-paginated-table";
import { SummaryOverview } from "./ui/summary-overview";

export default async function Purchases(props: {
  searchParams?: Promise<{
    page?: string;
  }>;
}) {
  const params = await props.searchParams;

  return (
    <div>
      <HeaderNav title="Purchases" newLink="/purchases/new" />
      <SummaryOverview />
      <PurchasesPaginatedTable page={Number(params?.page) || 1} />
    </div>
  );
}
