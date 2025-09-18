import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertPolicySchema, 
  insertStakingPositionSchema, 
  insertLoanSchema,
  insertBeneficiarySchema,
  insertClaimSchema,
  insertActivitySchema
} from "@shared/schema";
import { z } from "zod";

const DEMO_USER_ID = "demo-user-1";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get user profile
  app.get("/api/user", async (req, res) => {
    const user = await storage.getUser(DEMO_USER_ID);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  });

  // Update user balance
  app.patch("/api/user/balance", async (req, res) => {
    try {
      const balanceUpdateSchema = z.object({
        amount: z.string().refine(val => !isNaN(parseFloat(val)), "Must be a valid number"),
        operation: z.enum(["add", "subtract", "set"])
      });
      
      const { amount, operation } = balanceUpdateSchema.parse(req.body);
    const user = await storage.getUser(DEMO_USER_ID);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentBalance = parseFloat(user.ursolBalance || "0");
    let newBalance: number;

    if (operation === 'add') {
      newBalance = currentBalance + parseFloat(amount);
    } else if (operation === 'subtract') {
      newBalance = Math.max(0, currentBalance - parseFloat(amount));
    } else {
      newBalance = parseFloat(amount);
    }

    const updated = await storage.updateUser(DEMO_USER_ID, {
      ursolBalance: newBalance.toFixed(2)
    });

      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get user policies
  app.get("/api/policies", async (req, res) => {
    const policies = await storage.getUserPolicies(DEMO_USER_ID);
    res.json(policies);
  });

  // Create new policy (mint NFT)
  app.post("/api/policies", async (req, res) => {
    try {
      const validatedData = insertPolicySchema.parse({
        ...req.body,
        userId: DEMO_USER_ID,
        tokenId: Math.floor(Math.random() * 10000) + 1000,
        nextPremiumDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      const policy = await storage.createPolicy(validatedData);

      // Create burn activity
      const burnAmount = (parseFloat(validatedData.coverageAmount) * 0.05).toFixed(2);
      await storage.createActivity({
        userId: DEMO_USER_ID,
        type: "burn",
        description: `${burnAmount} URSOL burned from ${validatedData.tier} policy purchase`,
        amount: burnAmount,
      });

      // Update user balance
      const user = await storage.getUser(DEMO_USER_ID);
      if (user) {
        const newBalance = Math.max(0, parseFloat(user.ursolBalance || "0") - parseFloat(burnAmount));
        await storage.updateUser(DEMO_USER_ID, {
          ursolBalance: newBalance.toFixed(2)
        });
      }

      res.json(policy);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get staking positions
  app.get("/api/staking", async (req, res) => {
    const positions = await storage.getUserStakingPositions(DEMO_USER_ID);
    res.json(positions);
  });

  // Create staking position
  app.post("/api/staking", async (req, res) => {
    try {
      const validatedData = insertStakingPositionSchema.parse({
        ...req.body,
        userId: DEMO_USER_ID,
      });

      const position = await storage.createStakingPosition(validatedData);

      // Create activity
      await storage.createActivity({
        userId: DEMO_USER_ID,
        type: "stake",
        description: `Staked ${validatedData.amount} URSOL in ${validatedData.type.replace('_', ' ')}`,
        amount: validatedData.amount,
      });

      res.json(position);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Claim staking rewards
  app.post("/api/staking/:id/claim", async (req, res) => {
    try {
      // Get current position to capture pending rewards before zeroing
      const currentPosition = await storage.getUserStakingPositions(DEMO_USER_ID);
      const position = currentPosition.find(p => p.id === req.params.id);
      if (!position) throw new Error("Staking position not found");
      
      const claimedAmount = position.pendingRewards || "0";
      
      // Update position to zero out rewards
      const updatedPosition = await storage.updateStakingPosition(req.params.id, {
        pendingRewards: "0"
      });

      // Create activity with actual claimed amount
      await storage.createActivity({
        userId: DEMO_USER_ID,
        type: "claim_rewards",
        description: `Claimed rewards from ${position.type.replace('_', ' ')} staking`,
        amount: claimedAmount,
      });

      // Update user balance
      const user = await storage.getUser(DEMO_USER_ID);
      if (user) {
        const newBalance = parseFloat(user.ursolBalance || "0") + parseFloat(claimedAmount);
        await storage.updateUser(DEMO_USER_ID, {
          ursolBalance: newBalance.toFixed(2)
        });
      }

      res.json(updatedPosition);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get loans
  app.get("/api/loans", async (req, res) => {
    const loans = await storage.getUserLoans(DEMO_USER_ID);
    res.json(loans);
  });

  // Create loan
  app.post("/api/loans", async (req, res) => {
    try {
      const validatedData = insertLoanSchema.parse({
        ...req.body,
        userId: DEMO_USER_ID,
      });

      const loan = await storage.createLoan(validatedData);

      // Create activity
      await storage.createActivity({
        userId: DEMO_USER_ID,
        type: "borrow",
        description: `Borrowed ${validatedData.amount} URSOL against policy`,
        amount: validatedData.amount,
      });

      res.json(loan);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get beneficiaries
  app.get("/api/beneficiaries", async (req, res) => {
    const beneficiaries = await storage.getUserBeneficiaries(DEMO_USER_ID);
    res.json(beneficiaries);
  });

  // Save beneficiaries
  app.post("/api/beneficiaries", async (req, res) => {
    try {
      const validatedData = insertBeneficiarySchema.parse({
        ...req.body,
        userId: DEMO_USER_ID,
      });

      const beneficiary = await storage.createOrUpdateBeneficiary(validatedData);
      res.json(beneficiary);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get claims
  app.get("/api/claims", async (req, res) => {
    const claims = await storage.getUserClaims(DEMO_USER_ID);
    res.json(claims);
  });

  // Create claim
  app.post("/api/claims", async (req, res) => {
    try {
      const validatedData = insertClaimSchema.parse({
        ...req.body,
        userId: DEMO_USER_ID,
      });

      const claim = await storage.createClaim(validatedData);

      // Create activity
      await storage.createActivity({
        userId: DEMO_USER_ID,
        type: "claim_submitted",
        description: `Submitted claim for ${validatedData.amount} URSOL`,
        amount: validatedData.amount,
      });

      res.json(claim);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get activities
  app.get("/api/activities", async (req, res) => {
    const activities = await storage.getUserActivities(DEMO_USER_ID);
    res.json(activities);
  });

  // Get dashboard stats
  app.get("/api/dashboard", async (req, res) => {
    const [policies, stakingPositions, loans, activities] = await Promise.all([
      storage.getUserPolicies(DEMO_USER_ID),
      storage.getUserStakingPositions(DEMO_USER_ID),
      storage.getUserLoans(DEMO_USER_ID),
      storage.getUserActivities(DEMO_USER_ID)
    ]);

    const totalCoverage = policies.reduce((sum, p) => sum + parseFloat(p.coverageAmount), 0);
    const totalStaked = stakingPositions.reduce((sum, s) => sum + parseFloat(s.amount), 0);
    const totalRewards = stakingPositions.reduce((sum, s) => sum + parseFloat(s.pendingRewards || "0"), 0);
    const totalBorrowed = loans.reduce((sum, l) => l.isActive ? sum + parseFloat(l.amount) : sum, 0);

    res.json({
      totalCoverage: totalCoverage.toFixed(0),
      totalStaked: totalStaked.toFixed(0),
      totalRewards: totalRewards.toFixed(1),
      totalBorrowed: totalBorrowed.toFixed(0),
      activePolicies: policies.filter(p => p.isActive).length,
      activeLoans: loans.filter(l => l.isActive).length,
      recentActivities: activities.slice(0, 4)
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
