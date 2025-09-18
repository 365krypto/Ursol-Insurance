import { Crown, Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Policy } from "@shared/schema";

export function BorrowingInterface() {
  const [borrowAmount, setBorrowAmount] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: policies } = useQuery<Policy[]>({
    queryKey: ["/api/policies"],
  });

  const { data: loans } = useQuery({
    queryKey: ["/api/loans"],
  });

  const borrowMutation = useMutation({
    mutationFn: async () => {
      const availablePolicy = policies?.find(p => p.tier === "premium" && p.isActive);
      if (!availablePolicy) throw new Error("No available collateral policy");

      return apiRequest("POST", "/api/loans", {
        policyId: availablePolicy.id,
        amount: borrowAmount,
        interestRate: "8.5",
        healthFactor: "2.4",
        liquidationRatio: "150",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      setBorrowAmount("");
      
      toast({
        title: "Loan Successful!",
        description: `Borrowed ${borrowAmount} URSOL against your policy`,
      });
    },
    onError: (error) => {
      toast({
        title: "Borrowing Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const availablePolicies = policies?.filter(p => p.isActive) || [];
  const hasActiveLoan = (loans as any)?.some((loan: any) => loan.isActive);

  return (
    <div className="glass p-8 rounded-lg border border-border">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-6">Available Collateral</h3>
          
          <div className="space-y-4">
            {availablePolicies.map((policy) => {
              const isInUse = hasActiveLoan && policy.tier === "basic";
              const maxBorrow = parseFloat(policy.coverageAmount) * 0.6; // 60% LTV
              
              return (
                <div key={policy.id} className={`border border-border rounded-lg p-4 ${isInUse ? 'opacity-60' : ''}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 ${policy.tier === 'premium' ? 'bg-secondary/20' : 'bg-primary/20'} rounded-lg flex items-center justify-center mr-3`}>
                        {policy.tier === 'premium' ? (
                          <Crown className="text-secondary" />
                        ) : (
                          <Shield className="text-primary" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium" data-testid={`text-policy-${policy.tokenId}`}>
                          {policy.tier === 'premium' ? 'Premium' : 'Basic'} Policy #{policy.tokenId}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Coverage: {parseFloat(policy.coverageAmount).toLocaleString()} URSOL
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`${isInUse ? 'text-orange-500' : 'text-green-500'} font-medium`}>
                        {isInUse ? 'In Use' : 'Available'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {isInUse ? 'Borrowed: 15k' : 'LTV: 60%'}
                      </div>
                    </div>
                  </div>
                  {!isInUse && (
                    <div className="text-sm">
                      <div className="flex justify-between">
                        <span>Max Borrow:</span>
                        <span className="font-medium" data-testid={`text-max-borrow-${policy.tokenId}`}>
                          {maxBorrow.toLocaleString()} URSOL
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-6">Borrow Details</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="borrowAmount" className="block text-sm font-medium mb-2">
                Borrow Amount
              </Label>
              <div className="relative">
                <Input
                  id="borrowAmount"
                  type="number"
                  placeholder="0.00"
                  value={borrowAmount}
                  onChange={(e) => setBorrowAmount(e.target.value)}
                  className="pr-20"
                  data-testid="input-borrow-amount"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  URSOL
                </span>
              </div>
              <div className="text-sm text-muted-foreground mt-1">Max: 90,000 URSOL</div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Interest Rate</span>
                <span className="font-medium">8.5% APR</span>
              </div>
              <div className="flex justify-between">
                <span>Liquidation Ratio</span>
                <span className="font-medium">150%</span>
              </div>
              <div className="flex justify-between">
                <span>Health Factor</span>
                <span className="text-green-500 font-medium" data-testid="text-health-factor">2.4 (Safe)</span>
              </div>
            </div>

            <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="text-destructive mr-2 mt-0.5 flex-shrink-0" size={16} />
                <div className="text-sm">
                  <div className="font-medium text-destructive mb-1">Liquidation Risk</div>
                  <div className="text-muted-foreground">
                    Default on repayment will result in policy liquidation and revocation.
                  </div>
                </div>
              </div>
            </div>

            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              onClick={() => borrowMutation.mutate()}
              disabled={!borrowAmount || borrowMutation.isPending}
              data-testid="button-borrow-ursol"
            >
              {borrowMutation.isPending ? "Processing..." : "Borrow URSOL"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
