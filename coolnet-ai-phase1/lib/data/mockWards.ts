import type { WardGeometry, WardMeta } from "@/lib/types";

/**
 * DEMO & PROTOTYPE DATA NOTICE
 * -----------------------------------------------------------------------
 * The ward polygon geometries below represent Delhi NCR municipal zones.
 * Prototype climate risk predictions are mapped to stable `ward_id` keys.
 * Replace with official GIS files by updating `public/geojson/delhi-wards.geojson`.
 */

export const CITY_META = {
  name: "Delhi NCR Metro",
  center: [28.6139, 77.2090] as [number, number], // Delhi NCR center
  defaultZoom: 11,
  note: "Prototype Risk Prediction · Demo GeoJSON Boundaries",
};

export const DEMO_WARD_NAMES = [
  "Sadar Bazar",
  "Chandni Chowk",
  "Connaught Place",
  "Karol Bagh",
  "Rohini",
  "Dwarka",
  "South Extension",
  "Mayur Vihar",
  "Lajpat Nagar",
  "Okhla",
  "Civil Lines",
  "Shahdara",
];

export const DEMO_WARD_META: WardMeta[] = [
  { ward_id: "W-01", name: "Sadar Bazar", region: "Central Delhi", population: 48200, centroid: [28.655, 77.210] },
  { ward_id: "W-02", name: "Chandni Chowk", region: "Central Delhi", population: 52400, centroid: [28.655, 77.230] },
  { ward_id: "W-03", name: "Connaught Place", region: "New Delhi", population: 31100, centroid: [28.632, 77.212] },
  { ward_id: "W-04", name: "Karol Bagh", region: "Central Delhi", population: 44800, centroid: [28.652, 77.187] },
  { ward_id: "W-05", name: "Rohini", region: "North West Delhi", population: 89000, centroid: [28.715, 77.110] },
  { ward_id: "W-06", name: "Dwarka", region: "South West Delhi", population: 76500, centroid: [28.580, 77.052] },
  { ward_id: "W-07", name: "South Extension", region: "South Delhi", population: 38900, centroid: [28.572, 77.217] },
  { ward_id: "W-08", name: "Mayur Vihar", region: "East Delhi", population: 63200, centroid: [28.602, 77.295] },
  { ward_id: "W-09", name: "Lajpat Nagar", region: "South Delhi", population: 41800, centroid: [28.572, 77.250] },
  { ward_id: "W-10", name: "Okhla", region: "South East Delhi", population: 57600, centroid: [28.537, 77.287] },
  { ward_id: "W-11", name: "Civil Lines", region: "North Delhi", population: 35400, centroid: [28.685, 77.220] },
  { ward_id: "W-12", name: "Shahdara", region: "East Delhi", population: 71000, centroid: [28.660, 77.300] },
];

export const DEMO_WARD_GEOMETRY: WardGeometry[] = DEMO_WARD_META.map((m) => ({
  ward_id: m.ward_id,
  geojson: {
    type: "Polygon",
    coordinates: [
      [
        [m.centroid[1] - 0.015, m.centroid[0] + 0.015],
        [m.centroid[1] + 0.015, m.centroid[0] + 0.015],
        [m.centroid[1] + 0.015, m.centroid[0] - 0.015],
        [m.centroid[1] - 0.015, m.centroid[0] - 0.015],
        [m.centroid[1] - 0.015, m.centroid[0] + 0.015],
      ],
    ],
  },
}));

