import { createClient } from "@/utils/supabase/server";

/**
 * NEXUS MONETIZATION ENGINE (PHASE 4)
 * Manages strategic credit balances and transaction logic for founders.
 */

export const CREDIT_COSTS = {
  STRATEGIC_AUDIT: 5,
  SIMULATION: 2,
  ASSET_GENERATION: 1,
};

export class MoneyManager {
  /**
   * Checks if a user has sufficient credits and deducts them.
   */
  async consumeCredits(userId: string, cost: number): Promise<{ success: boolean; balance: number; error?: string }> {
    const supabase = await createClient();

    // 1. Fetch current balance
    const { data: profile, error: fError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single();

    if (fError || !profile) {
      return { success: false, balance: 0, error: "Profile not found." };
    }

    if (profile.credits < cost) {
      return { success: false, balance: profile.credits, error: "Insufficient Strategic Signal (Credits)." };
    }

    // 2. Atomic deduction
    const { data: updated, error: uError } = await supabase
      .from('profiles')
      .update({ credits: profile.credits - cost })
      .eq('id', userId)
      .select()
      .single();

    if (uError) {
      return { success: false, balance: profile.credits, error: "Transaction Failure." };
    }

    return { success: true, balance: updated.credits };
  }

  /**
   * Initializes a new founder's balance.
   */
  async initializeBalance(userId: string) {
    const supabase = await createClient();
    const INITIAL_GRANT = 25; // Phase 4 Starter Grant

    await supabase
      .from('profiles')
      .insert({ id: userId, credits: INITIAL_GRANT });
  }
}

export const moneyManager = new MoneyManager();
