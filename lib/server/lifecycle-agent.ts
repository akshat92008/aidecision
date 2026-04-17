import { callAgent } from './ai-provider';
import { 
  FinalReport, 
  Decision, 
  Milestone,
  FinalReportSchema 
} from '../shared/schemas';

/**
 * RE-EVALUATION ENGINE (PHASE 2)
 * Compares current progress (milestones) against historical benchmarks.
 */
export class LifecycleAgent {
  async evaluateProgress(decision: Decision, updates: string): Promise<{
    newReport: FinalReport;
    scoreDelta: number;
    insight: string;
  }> {
    const historicalReport = decision.last_report;
    const completedMilestones = decision.milestones.filter(m => m.status === 'completed');

    const prompt = `
Role: Senior Strategic Re-Evaluator
Objective: Analyze venture progress since the last Strategic Audit.

Historical Context:
- Original Summary: ${historicalReport.summary}
- Original Viability Score: ${decision.viability_score}%
- Completed Milestones: ${JSON.stringify(completedMilestones)}

Current Updates/Evidence:
"${updates}"

Task:
1. Recalculate the Viability Score using the 30/40/30 formula.
2. Identify if any "Insufficient Data" signals have been cleared.
3. Identify new risks based on execution friction.

Output: Return a full updated Strategic Audit.
`;

    // Implementation would call the standard multi-step pipeline but with comparison context
    // For Phase 2 implementation, we wrap the decision engine call
    const { data: updatedReport } = await this.runComparativeAudit(decision, updates);
    
    const scoreDelta = updatedReport.viability_score - decision.viability_score;
    const insight = scoreDelta >= 5 ? 
      "Strategic Momentum Detected. Execution is outpacing theoretical risks." : 
      (scoreDelta <= -5 ? "Friction Alert. Market reality is diverging from original assumptions." : "Stability Maintained.");

    return {
      newReport: updatedReport,
      scoreDelta,
      insight
    };
  }

  private async runComparativeAudit(decision: Decision, updates: string) {
    // This uses the DecisionEngine under the hood but with 'Updates' injected into the prompts
    // (Simplified for Phase 2 scaffold)
    const { nexusEngine } = await import('./decision-engine');
    const report = await nexusEngine.runStrategicAudit(
      `${decision.query} (Update Context: ${updates})`, 
      decision.constraints
    );
    return { data: report };
  }
}

export const lifecycleAgent = new LifecycleAgent();
