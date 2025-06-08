import { TransactionRepository } from "@/app/data/repo/transaction/transaction_repo";

export const SummaryOverview = async () => {
  const transactionRepository = new TransactionRepository();

  const latestPurchase = await transactionRepository.getLatestTransaction(
    "PURCHASE"
  );

  return !!latestPurchase ? (
    <div className="my-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Summary Overview
      </h1>
      <div className="flex space-x-4">
        <SummaryOverviewCard
          title="Total Quantity"
          value={latestPurchase.totalInventoryQuantity.toString()}
        />
        <SummaryOverviewCard
          title="Total Items Value (Cost)"
          value={`$${(
            latestPurchase.totalInventoryQuantity * latestPurchase.wac
          ).toLocaleString()}`}
        />
        <SummaryOverviewCard
          title="Weighted Average Cost"
          value={`$${latestPurchase.wac.toLocaleString()}`}
        />
      </div>
    </div>
  ) : (
    <></>
  );
};

const SummaryOverviewCard = ({
  title,
  value,
}: {
  title: string;
  value: string;
}) => {
  return (
    <div className="p-4 bg-gray-50 rounded-md">
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-xl font-semibold text-gray-900">{value}</p>
    </div>
  );
};
