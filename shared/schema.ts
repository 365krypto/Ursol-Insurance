import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  address: text("address").notNull().unique(),
  ursolBalance: decimal("ursol_balance", { precision: 18, scale: 2 }).default("0"),
  isWorldIdVerified: boolean("is_world_id_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const policies = pgTable("policies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  tokenId: integer("token_id").notNull().unique(),
  tier: text("tier").notNull(), // 'basic', 'premium', 'premium_urn'
  coverageAmount: decimal("coverage_amount", { precision: 18, scale: 2 }).notNull(),
  monthlyPremium: decimal("monthly_premium", { precision: 18, scale: 2 }).notNull(),
  stakingBonus: integer("staking_bonus").notNull(),
  isActive: boolean("is_active").default(true),
  nextPremiumDue: timestamp("next_premium_due"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const stakingPositions = pgTable("staking_positions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'insurance_pool', 'rewards'
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  apy: decimal("apy", { precision: 5, scale: 2 }).notNull(),
  pendingRewards: decimal("pending_rewards", { precision: 18, scale: 2 }).default("0"),
  lockPeriod: integer("lock_period").notNull(), // days
  createdAt: timestamp("created_at").defaultNow(),
});

export const loans = pgTable("loans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  policyId: varchar("policy_id").notNull().references(() => policies.id),
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }).notNull(),
  healthFactor: decimal("health_factor", { precision: 5, scale: 2 }).notNull(),
  liquidationRatio: decimal("liquidation_ratio", { precision: 5, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const beneficiaries = pgTable("beneficiaries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  encryptedData: text("encrypted_data").notNull(), // encrypted JSON
  onChainSettings: jsonb("on_chain_settings"), // visibility preferences
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const claims = pgTable("claims", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  policyId: varchar("policy_id").notNull().references(() => policies.id),
  payoutType: text("payout_type").notNull(), // 'lump_sum', 'installments', 'custom'
  status: text("status").default("pending"), // 'pending', 'approved', 'rejected', 'paid'
  verificationMethod: text("verification_method").notNull(), // 'world_id', 'oracle', 'community'
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  submittedAt: timestamp("submitted_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'mint', 'stake', 'claim_rewards', 'borrow', 'burn', 'premium_payment'
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 18, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  paymentId: text("payment_id").notNull().unique(), // Generated UUID for tracking
  type: text("type").notNull(), // 'premium', 'claim_payout', 'loan_repayment'
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  currency: text("currency").default("USDCE"),
  status: text("status").default("pending"), // 'pending', 'completed', 'failed', 'cancelled'
  relatedEntityId: varchar("related_entity_id"), // policy_id, loan_id, claim_id
  relatedEntityType: text("related_entity_type"), // 'policy', 'loan', 'claim'
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertPolicySchema = createInsertSchema(policies).omit({ id: true, createdAt: true });
export const insertStakingPositionSchema = createInsertSchema(stakingPositions).omit({ id: true, createdAt: true });
export const insertLoanSchema = createInsertSchema(loans).omit({ id: true, createdAt: true });
export const insertBeneficiarySchema = createInsertSchema(beneficiaries).omit({ id: true, createdAt: true, updatedAt: true });
export const insertClaimSchema = createInsertSchema(claims).omit({ id: true, submittedAt: true });
export const insertActivitySchema = createInsertSchema(activities).omit({ id: true, createdAt: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true, completedAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Policy = typeof policies.$inferSelect;
export type InsertPolicy = z.infer<typeof insertPolicySchema>;
export type StakingPosition = typeof stakingPositions.$inferSelect;
export type InsertStakingPosition = z.infer<typeof insertStakingPositionSchema>;
export type Loan = typeof loans.$inferSelect;
export type InsertLoan = z.infer<typeof insertLoanSchema>;
export type Beneficiary = typeof beneficiaries.$inferSelect;
export type InsertBeneficiary = z.infer<typeof insertBeneficiarySchema>;
export type Claim = typeof claims.$inferSelect;
export type InsertClaim = z.infer<typeof insertClaimSchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
