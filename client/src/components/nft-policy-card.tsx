import { Shield, Crown, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface NFTPolicyCardProps {
  tier: "basic" | "premium" | "premium_urn";
}

const tierConfig = {
  basic: {
    icon: Shield,
    title: "Basic Policy",
    description: "Essential protection",
    coverage: "50,000",
    premium: "25",
    bonus: "5%",
    price: "500",
    features: [
      "Basic coverage",
      "NFT certificate", 
      "Transferable"
    ],
    bgClass: "bg-primary/20",
    iconClass: "text-primary",
    buttonClass: "bg-primary hover:bg-primary/90 text-primary-foreground"
  },
  premium: {
    icon: Crown,
    title: "Premium Policy",
    description: "Enhanced benefits",
    coverage: "150,000",
    premium: "65",
    bonus: "10%",
    price: "1,500",
    features: [
      "All Basic features",
      "Borrowing collateral",
      "Will integration",
      "Family history tracking"
    ],
    bgClass: "bg-secondary/20",
    iconClass: "text-secondary",
    buttonClass: "bg-secondary hover:bg-secondary/90 text-secondary-foreground"
  },
  premium_urn: {
    icon: Gem,
    title: "Premium+Urn",
    description: "Ultimate protection",
    coverage: "500,000",
    premium: "180",
    bonus: "20%",
    price: "5,000",
    features: [
      "All Premium features",
      "Living Urn NFT",
      "Legacy vault",
      "Governance rights"
    ],
    bgClass: "bg-accent/20",
    iconClass: "text-accent",
    buttonClass: "bg-accent hover:bg-accent/90 text-accent-foreground"
  }
};

export function NFTPolicyCard({ tier }: NFTPolicyCardProps) {
  const config = tierConfig[tier];
  const IconComponent = config.icon;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mintPolicyMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/policies", {
        tier,
        coverageAmount: config.coverage,
        monthlyPremium: config.premium,
        stakingBonus: parseInt(config.bonus.replace('%', ''))
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/policies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      
      toast({
        title: "Policy Minted Successfully!",
        description: `Your ${config.title} NFT has been created and tokens burned.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Minting Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className={`gradient-border ${tier === 'basic' ? '' : 'nft-glow'}`}>
      <div className="gradient-border-inner p-6 h-full">
        <div className="text-center mb-6">
          <div className={`w-16 h-16 mx-auto mb-4 ${config.bgClass} rounded-full flex items-center justify-center`}>
            <IconComponent className={`${config.iconClass} text-2xl`} />
          </div>
          <h3 className="text-xl font-bold mb-2">{config.title}</h3>
          <p className="text-muted-foreground">{config.description}</p>
        </div>
        
        <div className="space-y-4 mb-6">
          <div className="flex justify-between">
            <span>Coverage Amount</span>
            <span className="font-medium">{config.coverage} URSOL</span>
          </div>
          <div className="flex justify-between">
            <span>Monthly Premium</span>
            <span className="font-medium">{config.premium} URSOL</span>
          </div>
          <div className="flex justify-between">
            <span>Staking Bonus</span>
            <span className="font-medium">{config.bonus}</span>
          </div>
        </div>
        
        <ul className="space-y-2 mb-8 text-sm">
          {config.features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              {feature}
            </li>
          ))}
        </ul>
        
        <Button 
          className={`w-full ${config.buttonClass} font-semibold transition-colors`}
          onClick={() => mintPolicyMutation.mutate()}
          disabled={mintPolicyMutation.isPending}
          data-testid={`button-mint-${tier}-policy`}
        >
          {mintPolicyMutation.isPending ? "Minting..." : `Mint Policy - ${config.price} URSOL`}
        </Button>
      </div>
    </div>
  );
}
