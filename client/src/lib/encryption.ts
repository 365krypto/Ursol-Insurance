// Mock encryption utilities for beneficiary data
export interface EncryptedData {
  data: string;
  salt: string;
  iv: string;
}

export interface BeneficiaryData {
  primaryBeneficiary: {
    name: string;
    relationship: string;
    allocation: number;
    contact: string;
  };
  secondaryBeneficiaries?: Array<{
    name: string;
    relationship: string;
    allocation: number;
    contact: string;
  }>;
  willDocument?: {
    filename: string;
    hash: string;
    uploadDate: Date;
  };
  preferences: {
    storeCountOnChain: boolean;
    storeAllocationsOnChain: boolean;
    enableNotifications: boolean;
  };
}

export class MockEncryption {
  private static instance: MockEncryption;
  
  public static getInstance(): MockEncryption {
    if (!MockEncryption.instance) {
      MockEncryption.instance = new MockEncryption();
    }
    return MockEncryption.instance;
  }

  private generateSalt(): string {
    return Array.from({ length: 32 }, () => 
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
    ).join('');
  }

  private generateIV(): string {
    return Array.from({ length: 16 }, () => 
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
    ).join('');
  }

  async encryptBeneficiaryData(data: BeneficiaryData, userKey?: string): Promise<EncryptedData> {
    // Simulate encryption process
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const jsonData = JSON.stringify(data);
    const salt = this.generateSalt();
    const iv = this.generateIV();
    
    // Simple encoding simulation (in real implementation, use proper encryption)
    const encoded = btoa(jsonData + salt + iv);
    
    return {
      data: encoded,
      salt,
      iv,
    };
  }

  async decryptBeneficiaryData(encryptedData: EncryptedData, userKey?: string): Promise<BeneficiaryData> {
    // Simulate decryption process
    await new Promise(resolve => setTimeout(resolve, 300));
    
    try {
      // Simple decoding simulation (in real implementation, use proper decryption)
      const decoded = atob(encryptedData.data);
      const jsonData = decoded.substring(0, decoded.length - 96); // Remove salt and IV
      return JSON.parse(jsonData);
    } catch (error) {
      throw new Error("Failed to decrypt beneficiary data");
    }
  }

  generateDefaultBeneficiaryData(): BeneficiaryData {
    return {
      primaryBeneficiary: {
        name: "",
        relationship: "spouse",
        allocation: 100,
        contact: "",
      },
      preferences: {
        storeCountOnChain: true,
        storeAllocationsOnChain: false,
        enableNotifications: false,
      },
    };
  }

  validateBeneficiaryData(data: BeneficiaryData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.primaryBeneficiary.name.trim()) {
      errors.push("Primary beneficiary name is required");
    }
    
    let totalAllocation = data.primaryBeneficiary.allocation;
    if (data.secondaryBeneficiaries) {
      totalAllocation += data.secondaryBeneficiaries.reduce((sum, b) => sum + b.allocation, 0);
    }
    
    if (totalAllocation !== 100) {
      errors.push("Total allocation must equal 100%");
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export const encryption = MockEncryption.getInstance();
