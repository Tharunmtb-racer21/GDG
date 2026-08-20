import { RiskLevel } from "@/lib/types";

export interface ActionRecommendation {
  id: string;
  title: string;
  category: "cooling" | "grid-ops" | "communication" | "vulnerability";
  priority: number;
  description: string;
  driverTrigger: string;
}

export function generateActionRecommendations(
  riskLevel: RiskLevel,
  primaryDriver: string,
  secondaryDriver: string,
  heatScore: number,
  gridScore: number,
  vulnerabilityScore: number,
  coolingAccessScore: number
): ActionRecommendation[] {
  const actions: ActionRecommendation[] = [];

  // 1. High Heat Stress Interventions
  if (heatScore >= 60) {
    actions.push({
      id: "act-misting-bus",
      title: "Dispatch Misting Bus Fleet #4",
      category: "cooling",
      priority: 1,
      description: "Deploy mobile evaporative misting buses to high-footfall transit hubs, street markets, and construction zones.",
      driverTrigger: "Elevated AI Heat Stress Score",
    });
    actions.push({
      id: "act-cooling-shelter",
      title: "Activate Air-Conditioned Cooling Shelters",
      category: "cooling",
      priority: 1,
      description: "Open community halls, libraries, and public facilities with emergency HVAC cooling and electrolyte stations.",
      driverTrigger: "High Ambient Heat Load",
    });
  }

  // 2. High Grid Stress Interventions
  if (gridScore >= 60) {
    actions.push({
      id: "act-grid-balance",
      title: "Prioritize Power Grid Load Balancing",
      category: "grid-ops",
      priority: 2,
      description: "Notify state electricity discoms to initiate demand-response load shedding in non-essential commercial districts to protect residential cooling feeder lines.",
      driverTrigger: "Severe Electrical Feeder Overload",
    });
    actions.push({
      id: "act-backup-gen",
      title: "Pre-Stage Emergency Backup Generators",
      category: "grid-ops",
      priority: 2,
      description: "Ready diesel/solar generator micro-grids at primary hospitals, trauma centers, and water pumping stations.",
      driverTrigger: "Elevated Grid Outage Risk",
    });
  }

  // 3. High Vulnerability & Low Cooling Access Interventions
  if (vulnerabilityScore >= 55 || coolingAccessScore <= 45) {
    actions.push({
      id: "act-community-outreach",
      title: "Deploy Healthcare Outreach Taskforce",
      category: "vulnerability",
      priority: 1,
      description: "Dispatch Accredited Social Health Activist (ASHA) workers to check on elderly individuals, children, and outdoor laborers.",
      driverTrigger: "High Social Vulnerability Index",
    });
    actions.push({
      id: "act-water-booth",
      title: "Set Up Public ORS Hydration Kiosks",
      category: "communication",
      priority: 3,
      description: "Distribute free Oral Rehydration Solution (ORS) packets and clean drinking water in densely populated slum clusters.",
      driverTrigger: "Cooling Access Deficit",
    });
  }

  // Fallback routine monitoring if low risk
  if (actions.length === 0) {
    actions.push({
      id: "act-routine-monitoring",
      title: "Maintain Routine Grid & Meteorological Telemetry",
      category: "grid-ops",
      priority: 4,
      description: "No emergency intervention required at present. Continue automated hourly observation.",
      driverTrigger: "Nominal Baseline Risk",
    });
  }

  return actions;
}
