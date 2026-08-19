export type DashboardTab =
  | "overview"
  | "map"
  | "forecast"
  | "simulator"
  | "interventions"
  | "data-health";

export const DASHBOARD_TABS: { id: DashboardTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "map", label: "Live Risk Map" },
  { id: "forecast", label: "Forecast" },
  { id: "simulator", label: "What-If Simulator" },
  { id: "interventions", label: "Interventions" },
  { id: "data-health", label: "Data Health" },
];
