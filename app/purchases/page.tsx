import PurchasesPaginatedTable from "./ui/purchases-paginated-table";

export default async function Purchases(props: {
  searchParams?: Promise<{
    page?: string;
  }>;
}) {
  const params = await props.searchParams;

  return <PurchasesPaginatedTable page={Number(params?.page) || 1} />;
}
