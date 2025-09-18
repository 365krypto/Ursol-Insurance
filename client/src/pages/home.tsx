import { Navigation } from "@/components/navigation";
import { NFTPolicyCard } from "@/components/nft-policy-card";
import { Button } from "@/components/ui/button";
import { Flame } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-secondary bg-clip-text text-transparent">
            Decentralized Life Insurance
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Secure your family's future with blockchain-powered life insurance. Mint NFT policies, stake tokens, and earn rewards while protecting what matters most.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg font-semibold" data-testid="button-get-policy">
              Get Your Policy
            </Button>
            <Button variant="outline" className="px-8 py-3 text-lg font-semibold" data-testid="button-learn-more">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* NFT Policy Tiers */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Choose Your Protection Level</h2>
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
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  URSOL
                </span>
              </div>
              <p className="text-muted-foreground text-sm">
                Decentralized life insurance powered by blockchain technology and DeFi mechanisms.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Products</h4>
              <div className="space-y-2 text-sm">
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors block">Life Insurance</a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors block">NFT Policies</a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors block">Staking</a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors block">Borrowing</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Protocol</h4>
              <div className="space-y-2 text-sm">
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors block">Governance</a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors block">Documentation</a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors block">Security</a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors block">Bug Bounty</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Community</h4>
              <div className="space-y-2 text-sm">
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors block">Discord</a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors block">Twitter</a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors block">GitHub</a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors block">Blog</a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-muted-foreground text-sm">
              © 2024 URSOL Protocol. Built on blockchain for the future of insurance.
            </p>
            <div className="mt-2 text-xs text-muted-foreground">
              Contract: <code className="bg-muted px-1 py-0.5 rounded">0x0748e0Ea581Fc3e9A97A68a3FC6F18Fc78743f9a</code>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
