import { Lock, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { encryption, type BeneficiaryData } from "@/lib/encryption";

export function BeneficiaryManager() {
  const [beneficiaryData, setBeneficiaryData] = useState<BeneficiaryData>(
    encryption.generateDefaultBeneficiaryData()
  );
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: beneficiaries } = useQuery({
    queryKey: ["/api/beneficiaries"],
  });

  useEffect(() => {
    if (beneficiaries && (beneficiaries as any).length > 0) {
      const latest = (beneficiaries as any)[0];
      encryption.decryptBeneficiaryData(JSON.parse(latest.encryptedData))
        .then(decrypted => setBeneficiaryData(decrypted))
        .catch(console.error);
    }
  }, [beneficiaries]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const validation = encryption.validateBeneficiaryData(beneficiaryData);
      if (!validation.valid) {
        throw new Error(validation.errors.join(", "));
      }

      const encrypted = await encryption.encryptBeneficiaryData(beneficiaryData);
      
      return apiRequest("POST", "/api/beneficiaries", {
        encryptedData: JSON.stringify(encrypted),
        onChainSettings: beneficiaryData.preferences,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/beneficiaries"] });
      
      toast({
        title: "Beneficiary Information Saved",
        description: "Your encrypted beneficiary data has been updated securely.",
      });
    },
    onError: (error) => {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePrimaryBeneficiary = (field: string, value: any) => {
    setBeneficiaryData(prev => ({
      ...prev,
      primaryBeneficiary: {
        ...prev.primaryBeneficiary,
        [field]: value,
      },
    }));
  };

  const updatePreferences = (field: string, value: boolean) => {
    setBeneficiaryData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value,
      },
    }));
  };

  return (
    <div className="glass p-8 rounded-lg border border-border">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-6">Beneficiary Information</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="primaryName" className="block text-sm font-medium mb-2">
                Primary Beneficiary
              </Label>
              <Input
                id="primaryName"
                placeholder="Full Name"
                value={beneficiaryData.primaryBeneficiary.name}
                onChange={(e) => updatePrimaryBeneficiary('name', e.target.value)}
                data-testid="input-primary-beneficiary-name"
              />
            </div>
            
            <div>
              <Label htmlFor="relationship" className="block text-sm font-medium mb-2">
                Relationship
              </Label>
              <Select
                value={beneficiaryData.primaryBeneficiary.relationship}
                onValueChange={(value) => updatePrimaryBeneficiary('relationship', value)}
              >
                <SelectTrigger data-testid="select-relationship">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spouse">Spouse</SelectItem>
                  <SelectItem value="child">Child</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="allocation" className="block text-sm font-medium mb-2">
                Allocation Percentage
              </Label>
              <Input
                id="allocation"
                type="number"
                placeholder="100"
                value={beneficiaryData.primaryBeneficiary.allocation}
                onChange={(e) => updatePrimaryBeneficiary('allocation', parseInt(e.target.value) || 0)}
                data-testid="input-allocation-percentage"
              />
            </div>
            
            <div>
              <Label htmlFor="contact" className="block text-sm font-medium mb-2">
                Contact Information
              </Label>
              <Textarea
                id="contact"
                placeholder="Address, phone, email..."
                rows={3}
                value={beneficiaryData.primaryBeneficiary.contact}
                onChange={(e) => updatePrimaryBeneficiary('contact', e.target.value)}
                className="resize-none"
                data-testid="textarea-contact-info"
              />
            </div>

            <Button 
              className="w-full bg-green-600 hover:bg-green-600/90 text-white"
              data-testid="button-add-secondary-beneficiary"
            >
              Add Secondary Beneficiary
            </Button>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-6">Privacy & Storage</h3>
          
          <div className="space-y-6">
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <Lock className="text-green-500 mr-2" size={16} />
                <span className="font-medium">Encryption Status</span>
              </div>
              <div className="text-sm text-muted-foreground">
                All beneficiary data is encrypted off-chain using your private key. Only you can decrypt and modify this information.
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">On-Chain Visibility Options</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="storeCount"
                    checked={beneficiaryData.preferences.storeCountOnChain}
                    onCheckedChange={(checked) => updatePreferences('storeCountOnChain', checked as boolean)}
                    data-testid="checkbox-store-count"
                  />
                  <Label htmlFor="storeCount" className="text-sm">
                    Store beneficiary count on-chain
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="storeAllocations"
                    checked={beneficiaryData.preferences.storeAllocationsOnChain}
                    onCheckedChange={(checked) => updatePreferences('storeAllocationsOnChain', checked as boolean)}
                    data-testid="checkbox-store-allocations"
                  />
                  <Label htmlFor="storeAllocations" className="text-sm">
                    Store allocation percentages on-chain
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="enableNotifications"
                    checked={beneficiaryData.preferences.enableNotifications}
                    onCheckedChange={(checked) => updatePreferences('enableNotifications', checked as boolean)}
                    data-testid="checkbox-enable-notifications"
                  />
                  <Label htmlFor="enableNotifications" className="text-sm">
                    Enable beneficiary wallet notifications
                  </Label>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Will Integration</h4>
              <div className="text-sm text-muted-foreground mb-3">
                Connect your legal will for seamless inheritance processing
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                data-testid="button-upload-will"
              >
                <Upload className="mr-2" size={16} />
                Upload Will Document
              </Button>
            </div>

            <div className="flex space-x-3">
              <Button 
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                data-testid="button-save-beneficiary-info"
              >
                {saveMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="outline" size="icon" data-testid="button-download-backup">
                <Upload className="rotate-180" size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
