import HeaderNav from "@/ui/headernav/headernav";

export default function PurchasesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <HeaderNav title="Purchases" />
      {children}
    </div>
  );
}
