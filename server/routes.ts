import type { Express } from "express";
import { createServer, type Server } from "http";
import crypto from "crypto";
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
import { blockchain } from "../client/src/lib/blockchain";

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

      // Server-side validation: ensure amount is greater than 0
      const amount = parseFloat(validatedData.amount);
      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ 
          message: "Amount must be greater than 0" 
        });
      }

      const position = await storage.createStakingPosition(validatedData);

      // Create activity
      await storage.createActivity({
        userId: DEMO_USER_ID,
        type: "stake",
        description: `Staked ${validatedData.amount} URSOL in ${validatedData.type.replace('_', ' ')}`,
        amount: validatedData.amount,
      });

      // Update user balance - deduct staked amount
      const user = await storage.getUser(DEMO_USER_ID);
      if (user) {
        const newBalance = Math.max(0, parseFloat(user.ursolBalance || "0") - parseFloat(validatedData.amount));
        await storage.updateUser(DEMO_USER_ID, {
          ursolBalance: newBalance.toFixed(2)
        });
      }

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

      // Update user balance - add the loan amount to user's URSOL balance
      const user = await storage.getUser(DEMO_USER_ID);
      if (user) {
        const newBalance = parseFloat(user.ursolBalance || "0") + parseFloat(validatedData.amount);
        await storage.updateUser(DEMO_USER_ID, {
          ursolBalance: newBalance.toFixed(2)
        });
      }

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

  // Get user payments
  app.get("/api/payments", async (req, res) => {
    const payments = await storage.getUserPayments(DEMO_USER_ID);
    res.json(payments);
  });

  // Payment initiation - official MiniKit pattern endpoint
  app.post("/api/initiate-payment", async (req, res) => {
    try {
      const { type, amount, currency, description } = req.body;
      
      // Generate UUID and remove dashes like in MiniKit example
      const paymentId = crypto.randomUUID().replace(/-/g, '');
      
      // Store the payment in database for later verification
      const payment = await storage.createPayment({
        userId: DEMO_USER_ID,
        paymentId: paymentId,
        type: type || "premium",
        amount: amount || "0",
        currency: currency || "USDC",
        status: "pending"
      });

      console.log(`[Payment] Initiated payment ${paymentId} for ${amount} ${currency}`);

      res.json({ id: paymentId });
    } catch (error) {
      console.error("Payment initiation error:", error);
      res.status(500).json({
        error: "Payment initiation failed"
      });
    }
  });

  // Payment initiation - generates UUID and stores in database (legacy endpoint)
  app.post("/api/payments/initiate", async (req, res) => {
    try {
      const { type, amount, currency, relatedEntityId, relatedEntityType } = req.body;
      
      // Generate UUID and remove dashes like in your example
      const paymentId = crypto.randomUUID().replace(/-/g, '');
      
      // Store the payment in database for later verification
      const payment = await storage.createPayment({
        userId: DEMO_USER_ID,
        paymentId: paymentId,
        type: type || "premium",
        amount: amount || "0",
        currency: currency || "USDCE",
        relatedEntityId: relatedEntityId || null,
        relatedEntityType: relatedEntityType || null,
        status: "pending"
      });

      console.log(`[Payment] Initiated payment ${paymentId} for ${amount} ${currency}`);

      // Log payment initiation activity
      await storage.createActivity({
        userId: DEMO_USER_ID,
        type: "premium_payment",
        description: `Payment initiated: ${amount} ${currency} (${paymentId})`,
        amount: amount || "0",
      });

      res.json({ id: paymentId });
    } catch (error) {
      console.error("Payment initiation error:", error);
      res.status(500).json({
        error: "Payment initiation failed"
      });
    }
  });

  // Payment confirmation - official MiniKit pattern with Worldcoin API verification
  app.post("/api/confirm-payment", async (req, res) => {
    try {
      const { payload } = req.body;
      
      if (!payload) {
        return res.status(400).json({
          success: false,
          message: "Missing payload in request body"
        });
      }

      console.log("[Payment] Confirming payment with payload:", JSON.stringify(payload, null, 2));
      
      // IMPORTANT: Here we fetch the reference from our database to ensure the transaction we are verifying is the same one we initiated
      const reference = payload.reference;
      if (!reference) {
        return res.status(400).json({
          success: false,
          message: "Missing reference in payload"
        });
      }

      // Find the payment record by reference ID
      console.log("[Payment] Looking up payment with reference:", reference);
      const paymentRecord = await storage.getPaymentByPaymentId(reference);
      
      if (!paymentRecord) {
        console.log("[Payment] Payment record not found for reference:", reference);
        return res.status(404).json({
          success: false,
          message: "Payment record not found"
        });
      }

      console.log("[Payment] Found payment record:", { id: paymentRecord.id, paymentId: paymentRecord.paymentId, status: paymentRecord.status });

      // 1. Check that the transaction we received from the mini app is the same one we sent
      if (payload.reference === paymentRecord.paymentId) {
        
        // 2. Verify transaction with Worldcoin developer API
        if (payload.transaction_id && process.env.APP_ID && process.env.DEV_PORTAL_API_KEY) {
          try {
            const response = await fetch(
              `https://developer.worldcoin.org/api/v2/minikit/transaction/${payload.transaction_id}?app_id=${process.env.APP_ID}`,
              {
                method: 'GET',
                headers: {
                  Authorization: `Bearer ${process.env.DEV_PORTAL_API_KEY}`,
                },
              }
            );
            
            if (!response.ok) {
              console.error("[Payment] Worldcoin API error:", response.status, response.statusText);
              return res.status(400).json({
                success: false,
                message: "Failed to verify transaction with Worldcoin API"
              });
            }
            
            const transaction = await response.json();
            console.log("[Payment] Worldcoin API response:", transaction);

            // 3. Here we optimistically confirm the transaction if reference matches and status is not failed
            if (transaction.reference === reference && transaction.status !== 'failed') {
              console.log("[Payment] Worldcoin API verification successful");
            } else {
              console.log("[Payment] Worldcoin API verification failed:", { 
                expectedRef: reference, 
                actualRef: transaction.reference, 
                status: transaction.status 
              });
              return res.status(400).json({
                success: false,
                message: "Transaction verification failed",
                details: {
                  referenceMatch: transaction.reference === reference,
                  status: transaction.status
                }
              });
            }
          } catch (apiError) {
            console.error("[Payment] Worldcoin API call failed:", apiError);
            // In development, continue without API verification
            console.log("[Payment] Continuing without API verification in development mode");
          }
        } else {
          console.log("[Payment] Missing API credentials, skipping Worldcoin API verification");
        }

        // Simulate blockchain event for payment verification in development
        const URSOL_TREASURY = "0x742d35cc6639c0532fda7df8e0fd7b30a9b7a34c";
        try {
          await blockchain.simulateTransferEvent(
            payload.sender || "0x0000000000000000000000000000000000000000",
            URSOL_TREASURY,
            paymentRecord.amount,
            paymentRecord.currency === "USDC" ? "0xA0b86a33E6441b4c2b3Eb0e25e9b3F9b5d4F8A4B" : "0x163F8C2467924BE0AE7B5347228CABF260318753",
            reference,
            true
          );
          
          // Verify the payment on blockchain
          const verification = await blockchain.verifyPaymentByReference(reference);
          
          if (verification.verified) {
            console.log("[Payment] Blockchain verification successful:", verification.event?.txHash);
          }
        } catch (error) {
          console.error("[Payment] Blockchain verification error:", error);
          // Don't fail the payment for blockchain verification errors in development
        }

        // Update payment status to completed
        const updatedPayment = await storage.updatePayment(paymentRecord.id, {
          status: "completed"
        });

        // Log successful payment activity
        await storage.createActivity({
          userId: DEMO_USER_ID,
          type: "premium_payment",
          description: `Payment completed: ${paymentRecord.amount} ${paymentRecord.currency} (${reference})`,
          amount: paymentRecord.amount,
        });

        console.log(`[Payment] Confirmed payment ${reference} successfully`);

        return res.json({
          success: true,
          message: "Payment confirmed successfully",
          payment: updatedPayment,
          transaction: payload
        });
      } else {
        console.log("[Payment] Reference mismatch:", { 
          payloadRef: payload.reference, 
          dbRef: paymentRecord.paymentId 
        });
        return res.status(400).json({
          success: false,
          message: "Payment reference mismatch"
        });
      }
    } catch (error) {
      console.error("Payment confirmation error:", error);
      res.status(500).json({
        success: false,
        message: "Payment confirmation failed"
      });
    }
  });

  // World ID proof verification
  app.post("/api/verify", async (req, res) => {
    try {
      const { payload, action, signal } = req.body;

      // Validate the payload structure
      if (!payload || !payload.proof || !payload.merkle_root || !payload.nullifier_hash) {
        return res.status(400).json({
          status: 400,
          message: "Invalid proof data"
        });
      }

      // Use World ID cloud verification API
      const app_id = process.env.APP_ID || "app_staging_ursol_minikit";
      
      try {
        // Import verifyCloudProof dynamically for Express compatibility
        const { verifyCloudProof } = await import('@worldcoin/minikit-js');
        
        const verifyRes = await verifyCloudProof(payload, app_id as `app_${string}`, action, signal);
        
        if (verifyRes.success) {
          // Log successful verification activity
          await storage.createActivity({
            userId: DEMO_USER_ID,
            type: "verification",
            description: `World ID verification completed for action: ${action}`,
            amount: "0",
          });

          console.log(`[World ID] Verification successful for action: ${action}`);
          console.log(`[World ID] Nullifier hash: ${payload.nullifier_hash}`);

          return res.json({
            verifyRes,
            status: 200
          });
        } else {
          // Handle verification failures (user already verified, etc.)
          console.log(`[World ID] Verification failed for action: ${action}`, verifyRes);
          
          return res.status(400).json({
            verifyRes,
            status: 400
          });
        }
      } catch (importError) {
        // Fallback to mock verification if verifyCloudProof is not available
        console.warn(`[World ID] Cloud verification not available, using mock verification:`, importError);
        
        // Log verification activity
        await storage.createActivity({
          userId: DEMO_USER_ID,
          type: "verification",
          description: `World ID verification completed for action: ${action} (mock)`,
          amount: "0",
        });

        return res.json({
          verifyRes: {
            success: true,
            action: action,
            nullifier_hash: payload.nullifier_hash
          },
          status: 200
        });
      }
    } catch (error) {
      console.error("World ID verification error:", error);
      res.status(500).json({
        verifyRes: {
          success: false,
          error: "Verification service error"
        },
        status: 500
      });
    }
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
