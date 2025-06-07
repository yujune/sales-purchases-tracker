import SalesPaginatedTable from "./ui/sales-paginated-table";

export default async function Sales(props: {
  searchParams?: Promise<{
    page?: string;
  }>;
}) {
  const params = await props.searchParams;

  return <SalesPaginatedTable page={Number(params?.page) || 1} />;
}
