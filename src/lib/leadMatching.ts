import { WeddingPlanner, PlannerLead, LeadScore } from '@/types/planner';

interface LeadMetrics {
  pageVisits: number;
  timeSpent: number;
  interactions: number;
  conversions: number;
}

export function calculateLeadScore(metrics: LeadMetrics): LeadScore {
  // Implement scoring logic
  const score = {
    engagement: metrics.pageVisits * 10 + metrics.timeSpent,
    interaction: metrics.interactions * 5,
    conversion: metrics.conversions * 20,
    total: 0
  };
  score.total = (score.engagement + score.interaction + score.conversion) / 3;
  return score;
}

export function matchPlanners(lead: PlannerLead, planners: WeddingPlanner[]): string[] {
  // Matching algorithm
  const matches = planners
    .map(planner => ({
      id: planner.id,
      score: calculateMatchScore(lead, planner)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(m => m.id);
  
  return matches;
}

function calculateMatchScore(lead: PlannerLead, planner: WeddingPlanner): number {
  let score = 0;
  // Add points for location match, specialty overlap, etc.
  return score;
}
