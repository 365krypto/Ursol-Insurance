import { Navigation } from "@/components/navigation";
import { NFTPolicyCard } from "@/components/nft-policy-card";
import { Flame } from "lucide-react";

export default function Policies() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Choose Your Protection Level</h1>
          <p className="text-muted-foreground text-lg">Each NFT represents a unique policy certificate with increasing benefits</p>
        </div>
        
        {/* Token Burn Indicator */}
        <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-center justify-center space-x-2 text-destructive">
            <Flame className="burn-animation" size={20} />
            <span className="font-medium">5% URSOL tokens burned with each policy purchase</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <NFTPolicyCard tier="basic" />
          <NFTPolicyCard tier="premium" />
          <NFTPolicyCard tier="premium_urn" />
        </div>
      </div>
    </div>
  );
}
