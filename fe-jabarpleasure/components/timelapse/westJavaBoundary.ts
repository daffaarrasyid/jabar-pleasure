/**
 * GeoJSON Polygon for Province of West Java (Provinsi Jawa Barat)
 * Used in INTRO_JABAR state to frame the region from top-down camera.
 */
export const WEST_JAVA_BOUNDARY_GEOJSON: GeoJSON.Feature<GeoJSON.Polygon> = {
  type: 'Feature',
  properties: {
    name: 'Provinsi Jawa Barat',
    id: 'ID-JB',
    center: [107.6098, -6.9175],
  },
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [106.35, -5.90],
        [106.65, -5.92],
        [106.90, -5.98],
        [107.25, -6.08],
        [107.60, -6.20],
        [108.05, -6.32],
        [108.45, -6.45],
        [108.80, -6.75],
        [108.88, -7.15],
        [108.85, -7.50],
        [108.65, -7.78],
        [108.35, -7.75],
        [108.00, -7.72],
        [107.60, -7.68],
        [107.20, -7.55],
        [106.85, -7.42],
        [106.50, -7.25],
        [106.35, -7.05],
        [106.35, -6.50],
        [106.35, -5.90],
      ],
    ],
  },
};

export const WEST_JAVA_BBOX: [number, number, number, number] = [
  106.35, // Min Longitude (West)
  -7.85,  // Min Latitude (South)
  108.88, // Max Longitude (East)
  -5.90,  // Max Latitude (North)
];
