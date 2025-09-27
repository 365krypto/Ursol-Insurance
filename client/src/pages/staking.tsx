import { Navigation } from "@/components/navigation";
import { StakingPool } from "@/components/staking-pool";
import { useQuery } from "@tanstack/react-query";
import { StakingPosition } from "@shared/schema";

export default function Staking() {
  const { data: stakingPositions } = useQuery<StakingPosition[]>({
    queryKey: ["/api/staking"],
  });

  // Aggregate staking positions by type
  const insurancePositions = stakingPositions?.filter(s => s.type === "insurance_pool") || [];
  const rewardsPositions = stakingPositions?.filter(s => s.type === "rewards") || [];
  
  const insurancePool = insurancePositions.length > 0 ? {
    id: insurancePositions[0].id, // Use first position ID for operations
    amount: insurancePositions.reduce((sum, pos) => sum + parseFloat(pos.amount), 0).toString(),
    apy: insurancePositions[0].apy, // APY should be same across positions
    pendingRewards: insurancePositions.reduce((sum, pos) => sum + parseFloat(pos.pendingRewards || "0"), 0).toString(),
    lockPeriod: insurancePositions[0].lockPeriod,
  } : undefined;
  
  const rewardsPool = rewardsPositions.length > 0 ? {
    id: rewardsPositions[0].id,
    amount: rewardsPositions.reduce((sum, pos) => sum + parseFloat(pos.amount), 0).toString(),
    apy: rewardsPositions[0].apy,
    pendingRewards: rewardsPositions.reduce((sum, pos) => sum + parseFloat(pos.pendingRewards || "0"), 0).toString(),
    lockPeriod: rewardsPositions[0].lockPeriod,
  } : undefined;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Dual Staking System</h1>
          <p className="text-muted-foreground text-lg">Choose your staking strategy to maximize rewards and benefits</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <StakingPool 
            type="insurance_pool" 
            data={insurancePool ? {
              id: insurancePool.id,
              amount: insurancePool.amount,
              apy: insurancePool.apy,
              pendingRewards: insurancePool.pendingRewards || "0",
              lockPeriod: insurancePool.lockPeriod,
            } : undefined}
          />
          
          <StakingPool 
            type="rewards" 
            data={rewardsPool ? {
              id: rewardsPool.id,
              amount: rewardsPool.amount,
              apy: rewardsPool.apy,
              pendingRewards: rewardsPool.pendingRewards || "0",
              lockPeriod: rewardsPool.lockPeriod,
            } : undefined}
          />
        </div>
      </div>
    </div>
  );
}
