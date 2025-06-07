export default function Home() {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">Sales & Purchases Tracker</h1>
      <br />
      <p className="text-lg text-gray-500">
        {`To record a new purchase, click the "Purchases" link in the sidebar.`}
        <br />
        {` To record a new sale, click the "Sales" link in the sidebar.`}
      </p>
    </div>
  );
}
