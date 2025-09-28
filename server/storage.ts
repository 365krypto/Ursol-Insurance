import { 
  type User, type InsertUser, 
  type Policy, type InsertPolicy,
  type StakingPosition, type InsertStakingPosition,
  type Loan, type InsertLoan,
  type Beneficiary, type InsertBeneficiary,
  type Claim, type InsertClaim,
  type Activity, type InsertActivity,
  type Payment, type InsertPayment
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByAddress(address: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;

  // Policies
  getUserPolicies(userId: string): Promise<Policy[]>;
  getPolicy(id: string): Promise<Policy | undefined>;
  createPolicy(policy: InsertPolicy): Promise<Policy>;
  updatePolicy(id: string, updates: Partial<Policy>): Promise<Policy>;

  // Staking
  getUserStakingPositions(userId: string): Promise<StakingPosition[]>;
  createStakingPosition(position: InsertStakingPosition): Promise<StakingPosition>;
  updateStakingPosition(id: string, updates: Partial<StakingPosition>): Promise<StakingPosition>;

  // Loans
  getUserLoans(userId: string): Promise<Loan[]>;
  createLoan(loan: InsertLoan): Promise<Loan>;
  updateLoan(id: string, updates: Partial<Loan>): Promise<Loan>;

  // Beneficiaries
  getUserBeneficiaries(userId: string): Promise<Beneficiary[]>;
  createOrUpdateBeneficiary(beneficiary: InsertBeneficiary): Promise<Beneficiary>;

  // Claims
  getUserClaims(userId: string): Promise<Claim[]>;
  createClaim(claim: InsertClaim): Promise<Claim>;
  updateClaim(id: string, updates: Partial<Claim>): Promise<Claim>;

  // Activities
  getUserActivities(userId: string): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  // Payments
  getUserPayments(userId: string): Promise<Payment[]>;
  getPaymentByPaymentId(paymentId: string): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: string, updates: Partial<Payment>): Promise<Payment>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private policies: Map<string, Policy> = new Map();
  private stakingPositions: Map<string, StakingPosition> = new Map();
  private loans: Map<string, Loan> = new Map();
  private beneficiaries: Map<string, Beneficiary> = new Map();
  private claims: Map<string, Claim> = new Map();
  private activities: Map<string, Activity> = new Map();
  private payments: Map<string, Payment> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Create a demo user
    const demoUser: User = {
      id: "demo-user-1",
      address: "0x742d35cc6639c0532fea175b7b6c7b50f5f3a8f8",
      ursolBalance: "15750.00",
      isWorldIdVerified: true,
      createdAt: new Date(),
    };
    this.users.set(demoUser.id, demoUser);

    // Create demo policies
    const policies = [
      {
        id: "policy-1",
        userId: demoUser.id,
        tokenId: 1247,
        tier: "premium",
        coverageAmount: "150000",
        monthlyPremium: "65",
        stakingBonus: 10,
        isActive: true,
        nextPremiumDue: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      },
      {
        id: "policy-2",
        userId: demoUser.id,
        tokenId: 892,
        tier: "basic",
        coverageAmount: "50000",
        monthlyPremium: "25",
        stakingBonus: 5,
        isActive: true,
        nextPremiumDue: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      }
    ];
    policies.forEach(p => this.policies.set(p.id, p));

    // Create demo staking positions
    const stakingPositions = [
      {
        id: "stake-1",
        userId: demoUser.id,
        type: "insurance_pool",
        amount: "2500",
        apy: "12.5",
        pendingRewards: "15.6",
        lockPeriod: 30,
        createdAt: new Date(),
      },
      {
        id: "stake-2",
        userId: demoUser.id,
        type: "rewards",
        amount: "1000",
        apy: "0",
        pendingRewards: "0",
        lockPeriod: 0,
        createdAt: new Date(),
      }
    ];
    stakingPositions.forEach(s => this.stakingPositions.set(s.id, s));

    // Create demo loan
    const loan: Loan = {
      id: "loan-1",
      userId: demoUser.id,
      policyId: "policy-2",
      amount: "15000",
      interestRate: "8.5",
      healthFactor: "2.4",
      liquidationRatio: "150",
      isActive: true,
      createdAt: new Date(),
    };
    this.loans.set(loan.id, loan);

    // Create demo activities
    const activities = [
      {
        id: "activity-1",
        userId: demoUser.id,
        type: "claim_rewards",
        description: "Earned 15.6 URSOL from Insurance Pool",
        amount: "15.6",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: "activity-2",
        userId: demoUser.id,
        type: "premium_payment",
        description: "Paid 65 URSOL for Premium Policy #1247",
        amount: "65",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        id: "activity-3",
        userId: demoUser.id,
        type: "borrow",
        description: "Borrowed 15k URSOL against Basic Policy",
        amount: "15000",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        id: "activity-4",
        userId: demoUser.id,
        type: "burn",
        description: "75 URSOL burned from Premium policy purchase",
        amount: "75",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    ];
    activities.forEach(a => this.activities.set(a.id, a));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByAddress(address: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.address === address);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      ursolBalance: insertUser.ursolBalance || "0",
      isWorldIdVerified: insertUser.isWorldIdVerified || false,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    const updated = { ...user, ...updates };
    this.users.set(id, updated);
    return updated;
  }

  async getUserPolicies(userId: string): Promise<Policy[]> {
    return Array.from(this.policies.values()).filter(p => p.userId === userId);
  }

  async getPolicy(id: string): Promise<Policy | undefined> {
    return this.policies.get(id);
  }

  async createPolicy(insertPolicy: InsertPolicy): Promise<Policy> {
    const id = randomUUID();
    const policy: Policy = { 
      ...insertPolicy, 
      id,
      isActive: insertPolicy.isActive ?? true,
      nextPremiumDue: insertPolicy.nextPremiumDue ?? null,
      createdAt: new Date()
    };
    this.policies.set(id, policy);
    return policy;
  }

  async updatePolicy(id: string, updates: Partial<Policy>): Promise<Policy> {
    const policy = this.policies.get(id);
    if (!policy) throw new Error("Policy not found");
    const updated = { ...policy, ...updates };
    this.policies.set(id, updated);
    return updated;
  }

  async getUserStakingPositions(userId: string): Promise<StakingPosition[]> {
    return Array.from(this.stakingPositions.values()).filter(s => s.userId === userId);
  }

  async createStakingPosition(insertPosition: InsertStakingPosition): Promise<StakingPosition> {
    const id = randomUUID();
    const position: StakingPosition = { 
      ...insertPosition, 
      id,
      pendingRewards: insertPosition.pendingRewards || "0",
      createdAt: new Date()
    };
    this.stakingPositions.set(id, position);
    return position;
  }

  async updateStakingPosition(id: string, updates: Partial<StakingPosition>): Promise<StakingPosition> {
    const position = this.stakingPositions.get(id);
    if (!position) throw new Error("Staking position not found");
    const updated = { ...position, ...updates };
    this.stakingPositions.set(id, updated);
    return updated;
  }

  async getUserLoans(userId: string): Promise<Loan[]> {
    return Array.from(this.loans.values()).filter(l => l.userId === userId);
  }

  async createLoan(insertLoan: InsertLoan): Promise<Loan> {
    const id = randomUUID();
    const loan: Loan = { 
      ...insertLoan, 
      id,
      isActive: insertLoan.isActive ?? true,
      createdAt: new Date()
    };
    this.loans.set(id, loan);
    return loan;
  }

  async updateLoan(id: string, updates: Partial<Loan>): Promise<Loan> {
    const loan = this.loans.get(id);
    if (!loan) throw new Error("Loan not found");
    const updated = { ...loan, ...updates };
    this.loans.set(id, updated);
    return updated;
  }

  async getUserBeneficiaries(userId: string): Promise<Beneficiary[]> {
    return Array.from(this.beneficiaries.values()).filter(b => b.userId === userId);
  }

  async createOrUpdateBeneficiary(insertBeneficiary: InsertBeneficiary): Promise<Beneficiary> {
    const existing = Array.from(this.beneficiaries.values()).find(b => b.userId === insertBeneficiary.userId);
    
    if (existing) {
      const updated = { 
        ...existing, 
        ...insertBeneficiary, 
        updatedAt: new Date()
      };
      this.beneficiaries.set(existing.id, updated);
      return updated;
    } else {
      const id = randomUUID();
      const beneficiary: Beneficiary = { 
        ...insertBeneficiary, 
        id,
        onChainSettings: insertBeneficiary.onChainSettings || null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.beneficiaries.set(id, beneficiary);
      return beneficiary;
    }
  }

  async getUserClaims(userId: string): Promise<Claim[]> {
    return Array.from(this.claims.values()).filter(c => c.userId === userId);
  }

  async createClaim(insertClaim: InsertClaim): Promise<Claim> {
    const id = randomUUID();
    const claim: Claim = { 
      ...insertClaim, 
      id,
      status: insertClaim.status || "pending",
      submittedAt: new Date()
    };
    this.claims.set(id, claim);
    return claim;
  }

  async updateClaim(id: string, updates: Partial<Claim>): Promise<Claim> {
    const claim = this.claims.get(id);
    if (!claim) throw new Error("Claim not found");
    const updated = { ...claim, ...updates };
    this.claims.set(id, updated);
    return updated;
  }

  async getUserActivities(userId: string): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(a => a.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = randomUUID();
    const activity: Activity = { 
      ...insertActivity, 
      id,
      amount: insertActivity.amount || null,
      createdAt: new Date()
    };
    this.activities.set(id, activity);
    return activity;
  }

  async getUserPayments(userId: string): Promise<Payment[]> {
    return Array.from(this.payments.values())
      .filter(p => p.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getPaymentByPaymentId(paymentId: string): Promise<Payment | undefined> {
    return Array.from(this.payments.values()).find(p => p.paymentId === paymentId);
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = randomUUID();
    const payment: Payment = { 
      ...insertPayment, 
      id,
      currency: insertPayment.currency || "USDCE",
      status: insertPayment.status || "pending",
      relatedEntityId: insertPayment.relatedEntityId || null,
      relatedEntityType: insertPayment.relatedEntityType || null,
      createdAt: new Date(),
      completedAt: null
    };
    this.payments.set(id, payment);
    return payment;
  }

  async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment> {
    const payment = this.payments.get(id);
    if (!payment) throw new Error("Payment not found");
    
    const updated = { 
      ...payment, 
      ...updates,
      completedAt: updates.status === 'completed' ? new Date() : payment.completedAt
    };
    this.payments.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
