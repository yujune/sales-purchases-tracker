import { SummaryOverview } from "../purchases/ui/summary-overview";
import HeaderNav from "../ui/headernav/headernav";
import SalesPaginatedTable from "./ui/sales-paginated-table";

export default async function Sales(props: {
  searchParams?: Promise<{
    page?: string;
  }>;
}) {
  const params = await props.searchParams;

  return (
    <div>
      <HeaderNav title="Sales" newLink="/sales/new" />
      <SummaryOverview />
      <SalesPaginatedTable page={Number(params?.page) || 1} />
    </div>
  );
}
