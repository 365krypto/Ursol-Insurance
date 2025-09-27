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

export interface TransferReferenceEvent {
  sender: string;
  recipient: string;
  amount: string;
  token: string;
  referenceId: string;
  success: boolean;
  txHash: string;
  blockNumber: number;
  timestamp: Date;
}

export interface PaymentVerificationResult {
  found: boolean;
  event?: TransferReferenceEvent;
  verified: boolean;
}

export class MockBlockchain {
  private static instance: MockBlockchain;
  private transferEvents: Map<string, TransferReferenceEvent> = new Map();
  
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

  // Simulate TransferReference event emission for payment verification
  async simulateTransferEvent(
    sender: string,
    recipient: string,
    amount: string,
    token: string,
    referenceId: string,
    success: boolean = true
  ): Promise<TransferReferenceEvent> {
    // Simulate blockchain delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const event: TransferReferenceEvent = {
      sender,
      recipient,
      amount,
      token,
      referenceId,
      success,
      txHash: this.generateTxHash(),
      blockNumber: this.generateBlockNumber(),
      timestamp: new Date(),
    };
    
    // Store event for later verification
    this.transferEvents.set(referenceId, event);
    
    console.log(`[Blockchain] TransferReference event emitted:`, {
      referenceId,
      success,
      txHash: event.txHash,
    });
    
    return event;
  }

  // Verify payment by checking for TransferReference event
  async verifyPaymentByReference(referenceId: string): Promise<PaymentVerificationResult> {
    // Simulate blockchain query delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const event = this.transferEvents.get(referenceId);
    
    if (!event) {
      console.log(`[Blockchain] No TransferReference event found for reference: ${referenceId}`);
      return {
        found: false,
        verified: false,
      };
    }
    
    // Verify the event indicates successful transfer
    const verified = event.success === true && !!event.amount && parseFloat(event.amount) > 0;
    
    console.log(`[Blockchain] Payment verification for ${referenceId}:`, {
      found: true,
      verified,
      txHash: event.txHash,
      amount: event.amount,
    });
    
    return {
      found: true,
      event,
      verified,
    };
  }

  // Listen for TransferReference events (in real implementation, this would use web3 event listeners)
  async listenForTransferEvents(
    callback: (event: TransferReferenceEvent) => void,
    fromBlock: number = 0
  ): Promise<void> {
    console.log(`[Blockchain] Starting to listen for TransferReference events from block ${fromBlock}`);
    
    // In real implementation, this would set up event listeners like:
    // contract.on('TransferReference', callback);
    
    // For mock, we simulate periodic event checks
    setInterval(() => {
      // In real implementation, this would poll for new events
      console.log('[Blockchain] Polling for new TransferReference events...');
    }, 30000); // Check every 30 seconds
  }

  // Get all transfer events for a specific recipient (useful for payment history)
  async getTransferEventsByRecipient(recipient: string): Promise<TransferReferenceEvent[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const events = Array.from(this.transferEvents.values())
      .filter(event => event.recipient.toLowerCase() === recipient.toLowerCase())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    console.log(`[Blockchain] Found ${events.length} transfer events for recipient: ${recipient}`);
    
    return events;
  }
}

export const blockchain = MockBlockchain.getInstance();
