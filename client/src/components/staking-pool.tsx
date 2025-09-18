import { Shield, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface StakingPoolProps {
  type: "insurance_pool" | "rewards";
  data?: {
    id: string;
    amount: string;
    apy: string;
    pendingRewards: string;
    lockPeriod: number;
  };
}

export function StakingPool({ type, data }: StakingPoolProps) {
  const [stakeAmount, setStakeAmount] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isInsurancePool = type === "insurance_pool";
  
  const config = {
    icon: isInsurancePool ? Shield : Gift,
    title: isInsurancePool ? "Insurance Pool Staking" : "Rewards Staking",
    subtitle: isInsurancePool ? "Back policy risk & earn yield" : "Earn discounts & governance",
    iconBg: isInsurancePool ? "bg-primary/20" : "bg-secondary/20",
    iconColor: isInsurancePool ? "text-primary" : "text-secondary",
    buttonClass: isInsurancePool ? "bg-primary hover:bg-primary/90" : "bg-secondary hover:bg-secondary/90",
  };

  const stakeMutation = useMutation({
    mutationFn: async (amount: string) => {
      return apiRequest("POST", "/api/staking", {
        type,
        amount,
        apy: isInsurancePool ? "12.5" : "0",
        pendingRewards: "0",
        lockPeriod: isInsurancePool ? 30 : 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staking"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      setStakeAmount("");
      
      toast({
        title: "Staking Successful!",
        description: `Staked ${stakeAmount} URSOL in ${config.title}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Staking Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const claimMutation = useMutation({
    mutationFn: async () => {
      if (!data?.id) throw new Error("No staking position found");
      return apiRequest("POST", `/api/staking/${data.id}/claim`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staking"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      
      toast({
        title: "Rewards Claimed!",
        description: `Successfully claimed ${data?.pendingRewards} URSOL`,
      });
    },
    onError: (error) => {
      toast({
        title: "Claim Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const IconComponent = config.icon;

  return (
    <div className="glass p-6 rounded-lg border border-border">
      <div className="flex items-center mb-6">
        <div className={`w-12 h-12 ${config.iconBg} rounded-lg flex items-center justify-center mr-4`}>
          <IconComponent className={`${config.iconColor} text-xl`} />
        </div>
        <div>
          <h3 className="text-xl font-bold">{config.title}</h3>
          <p className="text-muted-foreground">{config.subtitle}</p>
        </div>
      </div>
      
      <div className="space-y-4 mb-6">
        {isInsurancePool ? (
          <>
            <div className="flex justify-between">
              <span>Current APY</span>
              <span className="text-green-500 font-bold">{data?.apy || "12.5"}%</span>
            </div>
            <div className="flex justify-between">
              <span>Your Staked</span>
              <span className="font-medium" data-testid="text-insurance-staked">{data?.amount || "0"} URSOL</span>
            </div>
            <div className="flex justify-between">
              <span>Pending Rewards</span>
              <span className="text-green-500 font-medium" data-testid="text-insurance-rewards">{data?.pendingRewards || "0"} URSOL</span>
            </div>
            <div className="flex justify-between">
              <span>Lock Period</span>
              <span className="text-muted-foreground">{data?.lockPeriod || 30} days</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between">
              <span>Premium Discount</span>
              <span className="text-green-500 font-bold">15%</span>
            </div>
            <div className="flex justify-between">
              <span>Your Staked</span>
              <span className="font-medium" data-testid="text-rewards-staked">{data?.amount || "0"} URSOL</span>
            </div>
            <div className="flex justify-between">
              <span>Loyalty Points</span>
              <span className="text-secondary font-medium" data-testid="text-loyalty-points">342 pts</span>
            </div>
            <div className="flex justify-between">
              <span>Voting Power</span>
              <span className="text-muted-foreground">1.2k votes</span>
            </div>
          </>
        )}
      </div>

      {isInsurancePool && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Pool Utilization</span>
            <span>68%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-primary h-2 rounded-full" style={{width: "68%"}}></div>
          </div>
        </div>
      )}

      {!isInsurancePool && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Tier Progress</span>
            <span>Gold (Level 3)</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-gradient-to-r from-secondary to-accent h-2 rounded-full" style={{width: "75%"}}></div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex space-x-3">
          <Input
            type="number"
            placeholder="Amount to stake"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            className="flex-1"
            data-testid={`input-stake-${type}`}
          />
          <Button 
            className={`${config.buttonClass} px-6`}
            onClick={() => stakeMutation.mutate(stakeAmount)}
            disabled={!stakeAmount || stakeMutation.isPending}
            data-testid={`button-stake-${type}`}
          >
            {stakeMutation.isPending ? "Staking..." : "Stake"}
          </Button>
        </div>
        
        {isInsurancePool ? (
          <Button 
            className="w-full bg-green-600 hover:bg-green-600/90 text-white"
            onClick={() => claimMutation.mutate()}
            disabled={!data?.pendingRewards || parseFloat(data.pendingRewards) === 0 || claimMutation.isPending}
            data-testid="button-claim-insurance-rewards"
          >
            {claimMutation.isPending ? "Claiming..." : "Claim Rewards"}
          </Button>
        ) : (
          <Button 
            variant="outline" 
            className="w-full border-secondary text-secondary hover:bg-secondary/10"
            data-testid="button-view-governance"
          >
            View Governance
          </Button>
        )}
      </div>
    </div>
  );
}
