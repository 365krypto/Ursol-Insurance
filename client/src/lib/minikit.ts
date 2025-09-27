// MiniKit integration for URSOL Insurance Platform
import { MiniKit } from '@worldcoin/minikit-js';

// MiniKit configuration
const MINIKIT_CONFIG = {
  appId: "app_staging_ursol_minikit", // Replace with your actual app ID
  defaultChain: "0x1", // Ethereum mainnet, adjust as needed
};

export class URSOLMiniKit {
  private static instance: URSOLMiniKit;
  
  public static getInstance(): URSOLMiniKit {
    if (!URSOLMiniKit.instance) {
      URSOLMiniKit.instance = new URSOLMiniKit();
    }
    return URSOLMiniKit.instance;
  }

  // Check if MiniKit is available
  isInstalled(): boolean {
    return MiniKit.isInstalled();
  }

  // World ID Verification for Claims Processing
  async verifyWorldID(action: string, signal?: string): Promise<any> {
    if (!this.isInstalled()) {
      throw new Error("World App not installed. Please install World App to use this feature.");
    }

    const payload = {
      action: action, // e.g., "verify-claim", "verify-policy-purchase"
      signal: signal || "", // Optional signal for additional verification context
    };

    try {
      const result = await MiniKit.commands.verify(payload);
      return result;
    } catch (error) {
      console.error("World ID verification failed:", error);
      throw error;
    }
  }

  // Payment for premiums and claims
  async initiatePayment(
    amount: string, 
    currency: string = "USDCE", 
    description: string = "URSOL Insurance Payment"
  ): Promise<any> {
    if (!this.isInstalled()) {
      throw new Error("World App not installed. Please install World App to use this feature.");
    }

    const payload = {
      to: "0x742d35cc6639c0532fda7df8e0fd7b30a9b7a34c", // URSOL treasury address
      tokens: [{
        symbol: currency,
        token_amount: parseFloat(amount).toString(),
      }],
      description: description,
      reference: `ursol-payment-${Date.now()}`,
    };

    try {
      const result = await MiniKit.commands.pay(payload as any);
      return result;
    } catch (error) {
      console.error("Payment failed:", error);
      throw error;
    }
  }

  // Wallet Authentication
  async authenticateWallet(message?: string): Promise<any> {
    if (!this.isInstalled()) {
      throw new Error("World App not installed. Please install World App to use this feature.");
    }

    const payload = {
      nonce: Date.now().toString(),
      statement: message || "Sign in to URSOL Insurance Platform",
    };

    try {
      const result = await MiniKit.commands.walletAuth(payload);
      return result;
    } catch (error) {
      console.error("Wallet authentication failed:", error);
      throw error;
    }
  }

  // Send blockchain transaction (for policy minting, staking, etc.)
  async sendTransaction(
    to: string,
    data: string,
    value: string = "0"
  ): Promise<any> {
    if (!this.isInstalled()) {
      throw new Error("World App not installed. Please install World App to use this feature.");
    }

    const payload = {
      transaction: [{
        address: to,
        abi: [],
        functionName: "transfer",
        args: [],
        to: to,
        data: data,
        value: value,
      }]
    };

    try {
      const result = await MiniKit.commands.sendTransaction(payload as any);
      return result;
    } catch (error) {
      console.error("Transaction failed:", error);
      throw error;
    }
  }

  // Sign message for off-chain verification
  async signMessage(message: string): Promise<any> {
    if (!this.isInstalled()) {
      throw new Error("World App not installed. Please install World App to use this feature.");
    }

    const payload = {
      message: message,
    };

    try {
      const result = await MiniKit.commands.signMessage(payload);
      return result;
    } catch (error) {
      console.error("Message signing failed:", error);
      throw error;
    }
  }

  // Send haptic feedback for better UX
  async sendHapticFeedback(intensity: "light" | "medium" | "heavy" = "medium"): Promise<void> {
    if (!this.isInstalled()) {
      return; // Gracefully handle when not in World App
    }

    try {
      await (MiniKit.commands as any).sendHapticFeedback?.();
    } catch (error) {
      console.error("Haptic feedback failed:", error);
    }
  }

  // Share functionality
  async share(text: string, url?: string): Promise<any> {
    if (!this.isInstalled()) {
      throw new Error("World App not installed. Please install World App to use this feature.");
    }

    try {
      const result = await MiniKit.commands.share({
        text: text,
        url: url,
      });
      return result;
    } catch (error) {
      console.error("Share failed:", error);
      throw error;
    }
  }
}

export const minikit = URSOLMiniKit.getInstance();