import type { WardGeometry, WardMeta } from "@/lib/types";

/**
 * DEMO DATA NOTICE
 * -----------------------------------------------------------------------
 * The wards, boundaries, and city below are entirely fictional
 * ("Demo Metro Area"). They are generated for Phase 1 UI development
 * only and do not represent any real municipality, utility territory,
 * or government dataset. Replace with real ward GIS data in Phase 2.
 */

const CITY_CENTER: [number, number] = [21.15, 79.09]; // arbitrary demo coordinate
const GRID_COLS = 4;
const GRID_ROWS = 3;
const CELL_SIZE = 0.018; // degrees, ~2km

export const DEMO_WARD_NAMES = [
  "Ward 1",
  "Ward 2",
  "Ward 3",
  "Ward 4",
  "Ward 5",
  "Ward 6",
  "Ward 7",
  "Ward 8",
  "Ward 9",
  "Ward 10",
  "Ward 11",
  "Ward 12",
];

/** Simple deterministic pseudo-random generator so demo data is stable across reloads. */
function seededRandom(seed: number) {
  let t = seed + 0x6d2b79f5;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function buildGrid(): { meta: WardMeta[]; geometry: WardGeometry[] } {
  const meta: WardMeta[] = [];
  const geometry: WardGeometry[] = [];
  const startLat = CITY_CENTER[0] + (GRID_ROWS / 2) * CELL_SIZE;
  const startLng = CITY_CENTER[1] - (GRID_COLS / 2) * CELL_SIZE;
  const rand = seededRandom(42);

  let index = 0;
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const wardId = `W-${String(index + 1).padStart(2, "0")}`;
      const lat = startLat - row * CELL_SIZE;
      const lng = startLng + col * CELL_SIZE;

      // Add slight irregularity so polygons don't look like a perfect grid
      const jitter = () => (rand() - 0.5) * CELL_SIZE * 0.15;

      const nw: [number, number] = [lat + jitter(), lng + jitter()];
      const ne: [number, number] = [lat + jitter(), lng + CELL_SIZE + jitter()];
      const se: [number, number] = [lat - CELL_SIZE + jitter(), lng + CELL_SIZE + jitter()];
      const sw: [number, number] = [lat - CELL_SIZE + jitter(), lng + jitter()];

      const ring: [number, number][] = [nw, ne, se, sw, nw].map(([la, lo]) => [lo, la]);

      const centroidLat = lat - CELL_SIZE / 2;
      const centroidLng = lng + CELL_SIZE / 2;

      meta.push({
        ward_id: wardId,
        name: DEMO_WARD_NAMES[index],
        region: row < GRID_ROWS / 2 ? "North District" : "South District",
        population: Math.round(18000 + rand() * 42000),
        centroid: [centroidLat, centroidLng],
      });

      geometry.push({
        ward_id: wardId,
        geojson: {
          type: "Polygon",
          coordinates: [ring],
        },
      });

      index++;
    }
  }

  return { meta, geometry };
}

const { meta, geometry } = buildGrid();

export const DEMO_WARD_META: WardMeta[] = meta;
export const DEMO_WARD_GEOMETRY: WardGeometry[] = geometry;

export const CITY_META = {
  name: "Demo Metro Area",
  center: CITY_CENTER,
  defaultZoom: 12,
  note: "Fictional city used for Phase 1 demo purposes only.",
};
