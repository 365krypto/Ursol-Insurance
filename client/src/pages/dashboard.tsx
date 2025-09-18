import { Navigation } from "@/components/navigation";
import { Shield, Coins, Gift, DollarSign, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Crown } from "lucide-react";
import { Policy, Activity } from "@shared/schema";

export default function Dashboard() {
  const { data: dashboardData } = useQuery({
    queryKey: ["/api/dashboard"],
  });

  const { data: policies } = useQuery<Policy[]>({
    queryKey: ["/api/policies"],
  });

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'claim_rewards': return <Coins className="text-green-500 text-xs" />;
      case 'premium_payment': return <Shield className="text-blue-500 text-xs" />;
      case 'borrow': return <DollarSign className="text-orange-500 text-xs" />;
      case 'burn': return <div className="text-destructive text-xs">🔥</div>;
      default: return <Shield className="text-muted-foreground text-xs" />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-3xl font-bold mb-4">Portfolio Dashboard</h1>
          <p className="text-muted-foreground text-lg">Monitor your policies, staking, and rewards</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass p-6 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Shield className="text-primary text-xl" />
              </div>
              <span className="text-2xl font-bold" data-testid="text-total-coverage">
                {(dashboardData as any)?.totalCoverage || '0'}k
              </span>
            </div>
            <div className="text-sm text-muted-foreground">Total Coverage</div>
            <div className="text-xs text-green-500 mt-1">URSOL</div>
          </div>

          <div className="glass p-6 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                <Coins className="text-secondary text-xl" />
              </div>
              <span className="text-2xl font-bold" data-testid="text-total-staked">
                {(dashboardData as any)?.totalStaked || '0'}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">Total Staked</div>
            <div className="text-xs text-green-500 mt-1">+12.5% APY</div>
          </div>

          <div className="glass p-6 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Gift className="text-green-500 text-xl" />
              </div>
              <span className="text-2xl font-bold" data-testid="text-total-rewards">
                {(dashboardData as any)?.totalRewards || '0'}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">Pending Rewards</div>
            <div className="text-xs text-green-500 mt-1">URSOL</div>
          </div>

          <div className="glass p-6 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="text-orange-500 text-xl" />
              </div>
              <span className="text-2xl font-bold" data-testid="text-total-borrowed">
                {(dashboardData as any)?.totalBorrowed || '0'}k
              </span>
            </div>
            <div className="text-sm text-muted-foreground">Active Loans</div>
            <div className="text-xs text-orange-500 mt-1">8.5% APR</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* NFT Portfolio */}
          <div className="lg:col-span-2">
            <div className="glass p-6 rounded-lg border border-border">
              <h3 className="text-xl font-bold mb-6">Your NFT Policies</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                {policies?.map((policy) => {
                  const isPremium = policy.tier === 'premium';
                  const isInUse = policy.tier === 'basic'; // Demo: basic policy has loan
                  
                  return (
                    <div key={policy.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 ${isPremium ? 'bg-secondary/20' : 'bg-primary/20'} rounded-lg flex items-center justify-center mr-3`}>
                            {isPremium ? (
                              <Crown className="text-secondary" />
                            ) : (
                              <Shield className="text-primary" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium" data-testid={`text-policy-${policy.tokenId}`}>
                              {policy.tier.charAt(0).toUpperCase() + policy.tier.slice(1)} #{policy.tokenId}
                            </div>
                            <div className={`text-sm ${isInUse ? 'text-orange-500' : 'text-green-500'}`}>
                              {isInUse ? 'Borrowed' : 'Active'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{parseFloat(policy.coverageAmount) / 1000}k</div>
                          <div className="text-xs text-muted-foreground">URSOL</div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <div>Premium: {policy.monthlyPremium} URSOL/month</div>
                        {isInUse ? (
                          <div>Loan: 15k URSOL</div>
                        ) : (
                          <div>Next: {policy.nextPremiumDue ? new Date(policy.nextPremiumDue).toLocaleDateString() : 'N/A'}</div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Add Policy Button */}
                <div className="border-2 border-dashed border-border rounded-lg p-4 flex items-center justify-center">
                  <button className="text-center" data-testid="button-add-new-policy">
                    <Plus className="text-muted-foreground text-2xl mb-2 mx-auto" />
                    <div className="text-sm text-muted-foreground">Add New Policy</div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="glass p-6 rounded-lg border border-border">
            <h3 className="text-xl font-bold mb-6">Recent Activity</h3>
            
            <div className="space-y-4">
              {(dashboardData as any)?.recentActivities?.map((activity: Activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-muted/20 rounded-full flex items-center justify-center mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium" data-testid={`text-activity-${activity.id}`}>
                      {activity.type === 'claim_rewards' && 'Staking Reward'}
                      {activity.type === 'premium_payment' && 'Premium Payment'}
                      {activity.type === 'borrow' && 'Loan Taken'}
                      {activity.type === 'burn' && 'Token Burn'}
                    </div>
                    <div className="text-xs text-muted-foreground">{activity.description}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatTimeAgo(activity.createdAt!)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-6 text-sm text-primary hover:text-primary/80 transition-colors" data-testid="button-view-all-activity">
              View All Activity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
