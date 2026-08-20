/**
 * Major Indian Districts & Cities Dataset
 * Includes geographic coordinates, state name, and baseline risk metrics for rapid search and selection.
 */

export interface IndianDistrictMeta {
  id: string;
  name: string;
  state: string;
  lat: number;
  lon: number;
  riskScore: number;
  riskLevel: "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
}

export const INDIAN_DISTRICTS: IndianDistrictMeta[] = [
  // Tamil Nadu
  { id: "TN-COI", name: "Coimbatore", state: "Tamil Nadu", lat: 11.0168, lon: 76.9558, riskScore: 78, riskLevel: "HIGH" },
  { id: "TN-CHE", name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lon: 80.2707, riskScore: 84, riskLevel: "HIGH" },
  { id: "TN-MAD", name: "Madurai", state: "Tamil Nadu", lat: 9.9252, lon: 78.1198, riskScore: 82, riskLevel: "HIGH" },
  { id: "TN-SAL", name: "Salem", state: "Tamil Nadu", lat: 11.6643, lon: 78.146, riskScore: 76, riskLevel: "HIGH" },
  { id: "TN-TRI", name: "Tiruchirappalli", state: "Tamil Nadu", lat: 10.7905, lon: 78.7047, riskScore: 79, riskLevel: "HIGH" },

  // Maharashtra
  { id: "MH-MUM", name: "Mumbai", state: "Maharashtra", lat: 19.076, lon: 72.8777, riskScore: 88, riskLevel: "CRITICAL" },
  { id: "MH-PUN", name: "Pune", state: "Maharashtra", lat: 18.5204, lon: 73.8567, riskScore: 74, riskLevel: "HIGH" },
  { id: "MH-NAG", name: "Nagpur", state: "Maharashtra", lat: 21.1458, lon: 79.0882, riskScore: 86, riskLevel: "CRITICAL" },
  { id: "MH-NSK", name: "Nashik", state: "Maharashtra", lat: 20.0059, lon: 73.7898, riskScore: 68, riskLevel: "HIGH" },

  // Delhi NCR
  { id: "DL-CEN", name: "Central Delhi", state: "Delhi", lat: 28.6139, lon: 77.209, riskScore: 85, riskLevel: "CRITICAL" },
  { id: "DL-SOU", name: "South Delhi", state: "Delhi", lat: 28.5244, lon: 77.1855, riskScore: 78, riskLevel: "HIGH" },
  { id: "DL-NOR", name: "North West Delhi", state: "Delhi", lat: 28.7183, lon: 77.0664, riskScore: 81, riskLevel: "HIGH" },

  // Karnataka
  { id: "KA-BLR", name: "Bengaluru Urban", state: "Karnataka", lat: 12.9716, lon: 77.5946, riskScore: 72, riskLevel: "HIGH" },
  { id: "KA-MYS", name: "Mysuru", state: "Karnataka", lat: 12.2958, lon: 76.6394, riskScore: 64, riskLevel: "HIGH" },
  { id: "KA-MNG", name: "Mangaluru", state: "Karnataka", lat: 12.9141, lon: 74.856, riskScore: 77, riskLevel: "HIGH" },

  // Telangana & Andhra Pradesh
  { id: "TS-HYD", name: "Hyderabad", state: "Telangana", lat: 17.385, lon: 78.4867, riskScore: 83, riskLevel: "HIGH" },
  { id: "AP-VIZ", name: "Visakhapatnam", state: "Andhra Pradesh", lat: 17.6868, lon: 83.2185, riskScore: 80, riskLevel: "HIGH" },

  // Gujarat & Rajasthan
  { id: "GJ-AMD", name: "Ahmedabad", state: "Gujarat", lat: 23.0225, lon: 72.5714, riskScore: 89, riskLevel: "CRITICAL" },
  { id: "GJ-SUR", name: "Surat", state: "Gujarat", lat: 21.1702, lon: 72.8311, riskScore: 83, riskLevel: "HIGH" },
  { id: "RJ-JAI", name: "Jaipur", state: "Rajasthan", lat: 26.9124, lon: 75.7873, riskScore: 87, riskLevel: "CRITICAL" },

  // West Bengal & Uttar Pradesh
  { id: "WB-KOL", name: "Kolkata", state: "West Bengal", lat: 22.5726, lon: 88.3639, riskScore: 86, riskLevel: "CRITICAL" },
  { id: "UP-LKO", name: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lon: 80.9462, riskScore: 82, riskLevel: "HIGH" },
  { id: "UP-KAN", name: "Kanpur", state: "Uttar Pradesh", lat: 26.4499, lon: 80.3319, riskScore: 84, riskLevel: "HIGH" },
];
