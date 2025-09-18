import { Navigation } from "@/components/navigation";
import { BeneficiaryManager } from "@/components/beneficiary-manager";

export default function Beneficiaries() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Manage Beneficiaries & Will</h1>
          <p className="text-muted-foreground text-lg">Secure off-chain storage with user-controlled encryption</p>
        </div>

        <BeneficiaryManager />
      </div>
    </div>
  );
}
