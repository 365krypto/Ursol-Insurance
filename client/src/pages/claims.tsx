import { Navigation } from "@/components/navigation";
import { ClaimsInterface } from "@/components/claims-interface";

export default function Claims() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Parametric Claims Processing</h1>
          <p className="text-muted-foreground text-lg">Automated verification through World ID and oracle feeds</p>
        </div>

        <ClaimsInterface />
      </div>
    </div>
  );
}
