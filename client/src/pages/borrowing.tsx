import { Navigation } from "@/components/navigation";
import { BorrowingInterface } from "@/components/borrowing-interface";

export default function Borrowing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Borrow Against Your Policy</h1>
          <p className="text-muted-foreground text-lg">Use your NFT policy as collateral for instant liquidity</p>
        </div>

        <BorrowingInterface />
      </div>
    </div>
  );
}
