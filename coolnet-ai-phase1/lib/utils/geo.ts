/**
 * Geographic Representative Centroid Utility
 * Calculates [latitude, longitude] point-on-surface / centroid for GeoJSON Polygon & MultiPolygon features.
 */

export function getFeatureCentroid(feature: any): [number, number] {
  if (!feature || !feature.geometry) return [22.5937, 78.9629]; // Default India

  const { type, coordinates } = feature.geometry;

  // Explicit centroid property if provided
  if (feature.properties && feature.properties.centroid) {
    const c = feature.properties.centroid;
    if (Array.isArray(c) && c.length === 2) {
      // If centroid is [lng, lat], normalize to [lat, lng]
      if (c[0] > 50 && c[1] < 40) return [c[1], c[0]];
      return [c[0], c[1]];
    }
  }

  let points: [number, number][] = [];

  if (type === "Polygon") {
    // Ring 0 is outer boundary: coordinates[0] is array of [lng, lat]
    points = coordinates[0] || [];
  } else if (type === "MultiPolygon") {
    // Flatten all rings
    coordinates.forEach((poly: any) => {
      if (poly && poly[0]) {
        points = points.concat(poly[0]);
      }
    });
  }

  if (points.length === 0) return [22.5937, 78.9629];

  let sumLng = 0;
  let sumLat = 0;
  points.forEach(([lng, lat]) => {
    sumLng += lng;
    sumLat += lat;
  });

  const avgLng = sumLng / points.length;
  const avgLat = sumLat / points.length;

  return [avgLat, avgLng]; // Returns [latitude, longitude]
}
