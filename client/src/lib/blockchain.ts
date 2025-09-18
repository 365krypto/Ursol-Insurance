// Mock blockchain utilities for URSOL platform
export interface TokenBurnResult {
  amount: string;
  txHash: string;
  blockNumber: number;
}

export interface NFTMintResult {
  tokenId: number;
  contractAddress: string;
  txHash: string;
}

export class MockBlockchain {
  private static instance: MockBlockchain;
  
  public static getInstance(): MockBlockchain {
    if (!MockBlockchain.instance) {
      MockBlockchain.instance = new MockBlockchain();
    }
    return MockBlockchain.instance;
  }

  private generateTxHash(): string {
    return `0x${Math.random().toString(16).substring(2, 34)}${Math.random().toString(16).substring(2, 34)}`;
  }

  private generateBlockNumber(): number {
    return Math.floor(Math.random() * 1000000) + 18000000;
  }

  async burnTokens(amount: string): Promise<TokenBurnResult> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      amount,
      txHash: this.generateTxHash(),
      blockNumber: this.generateBlockNumber(),
    };
  }

  async mintNFT(tier: string): Promise<NFTMintResult> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      tokenId: Math.floor(Math.random() * 10000) + 1000,
      contractAddress: "0x0748e0Ea581Fc3e9A97A68a3FC6F18Fc78743f9a",
      txHash: this.generateTxHash(),
    };
  }

  async verifyWorldId(): Promise<boolean> {
    // Simulate World ID verification
    await new Promise(resolve => setTimeout(resolve, 3000));
    return Math.random() > 0.1; // 90% success rate
  }

  async checkOracleStatus(): Promise<{ connected: boolean; lastUpdate: Date }> {
    return {
      connected: true,
      lastUpdate: new Date(),
    };
  }

  async simulateStakingRewards(amount: string, apy: string, days: number): Promise<string> {
    const principal = parseFloat(amount);
    const rate = parseFloat(apy) / 100;
    const rewards = (principal * rate * days) / 365;
    return rewards.toFixed(6);
  }

  async calculateLiquidationRisk(collateralValue: string, debtValue: string): Promise<{
    healthFactor: string;
    liquidationThreshold: string;
    riskLevel: 'safe' | 'moderate' | 'high';
  }> {
    const collateral = parseFloat(collateralValue);
    const debt = parseFloat(debtValue);
    const healthFactor = (collateral * 0.8) / debt; // 80% collateral ratio
    
    let riskLevel: 'safe' | 'moderate' | 'high' = 'safe';
    if (healthFactor < 1.2) riskLevel = 'high';
    else if (healthFactor < 1.5) riskLevel = 'moderate';
    
    return {
      healthFactor: healthFactor.toFixed(2),
      liquidationThreshold: "1.5",
      riskLevel,
    };
  }
}

export const blockchain = MockBlockchain.getInstance();
