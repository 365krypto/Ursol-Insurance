import { UserCheck, CheckCircle, Database, Users, Info, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Policy } from "@shared/schema";

export function ClaimsInterface() {
  const [selectedPolicy, setSelectedPolicy] = useState("");
  const [payoutType, setPayoutType] = useState("lump_sum");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: policies } = useQuery<Policy[]>({
    queryKey: ["/api/policies"],
  });

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const submitClaimMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPolicy) throw new Error("Please select a policy");
      
      const policy = policies?.find(p => p.id === selectedPolicy);
      if (!policy) throw new Error("Policy not found");

      return apiRequest("POST", "/api/claims", {
        policyId: selectedPolicy,
        payoutType,
        status: "pending",
        verificationMethod: "world_id",
        amount: policy.coverageAmount,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/claims"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      
      toast({
        title: "Claim Submitted Successfully",
        description: "Your claim has been submitted for review and verification.",
      });
    },
    onError: (error) => {
      toast({
        title: "Claim Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isVerified = (user as any)?.isWorldIdVerified || false;
  const activePolicies = policies?.filter(p => p.isActive) || [];

  return (
    <div className="glass p-8 rounded-lg border border-border">
      <div className="mb-8">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
            <UserCheck className="text-primary text-2xl" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-center mb-2">World ID Verification Required</h3>
        <p className="text-muted-foreground text-center">Only verified users can initiate claim processes</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h4 className="font-bold mb-4">Verification Status</h4>
          
          <div className="space-y-4">
            <div className={`flex items-center justify-between p-3 ${
              isVerified 
                ? 'bg-green-500/10 border border-green-500/20' 
                : 'bg-destructive/10 border border-destructive/20'
            } rounded-lg`}>
              <div className="flex items-center">
                <CheckCircle className={`${isVerified ? 'text-green-500' : 'text-destructive'} mr-3`} size={16} />
                <span>World ID Verified</span>
              </div>
              <span className={`text-sm ${isVerified ? 'text-green-500' : 'text-destructive'}`}>
                {isVerified ? '✓ Active' : '✗ Pending'}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center">
                <Database className="text-muted-foreground mr-3" size={16} />
                <span>Oracle Feed Access</span>
              </div>
              <span className="text-green-500 text-sm" data-testid="text-oracle-status">✓ Connected</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center">
                <Users className="text-muted-foreground mr-3" size={16} />
                <span>Community Backup</span>
              </div>
              <span className="text-muted-foreground text-sm">Available</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-start">
              <Info className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
              <div className="text-sm">
                <div className="font-medium text-blue-500 mb-1">Hybrid Verification</div>
                <div className="text-muted-foreground">
                  Primary verification through World ID and oracle feeds, with community verification as fallback option.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-bold mb-4">Claim Submission</h4>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="policySelect" className="block text-sm font-medium mb-2">
                Policy to Claim
              </Label>
              <Select value={selectedPolicy} onValueChange={setSelectedPolicy}>
                <SelectTrigger data-testid="select-claim-policy">
                  <SelectValue placeholder="Select a policy" />
                </SelectTrigger>
                <SelectContent>
                  {activePolicies.map((policy) => (
                    <SelectItem key={policy.id} value={policy.id}>
                      {policy.tier.charAt(0).toUpperCase() + policy.tier.slice(1)} Policy #{policy.tokenId} 
                      ({parseFloat(policy.coverageAmount).toLocaleString()}k URSOL)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="block text-sm font-medium mb-2">
                Payout Preference
              </Label>
              <RadioGroup value={payoutType} onValueChange={setPayoutType}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="lump_sum" id="lump_sum" />
                  <Label htmlFor="lump_sum" className="text-sm">Lump Sum Payment</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="installments" id="installments" />
                  <Label htmlFor="installments" className="text-sm">Monthly Installments (10 years)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom" className="text-sm">Custom Schedule</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div>
              <Label className="block text-sm font-medium mb-2">
                Supporting Documentation
              </Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <Upload className="text-muted-foreground text-2xl mb-2 mx-auto" />
                <div className="text-sm text-muted-foreground">
                  Upload death certificate or other verification documents
                </div>
                <Button variant="ghost" className="mt-2 text-primary hover:text-primary/80" data-testid="button-browse-files">
                  Browse Files
                </Button>
              </div>
            </div>

            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              onClick={() => submitClaimMutation.mutate()}
              disabled={!selectedPolicy || !isVerified || submitClaimMutation.isPending}
              data-testid="button-submit-claim"
            >
              {submitClaimMutation.isPending ? "Submitting..." : "Submit Claim for Review"}
            </Button>

            {!isVerified && (
              <p className="text-sm text-destructive text-center">
                World ID verification required to submit claims
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
