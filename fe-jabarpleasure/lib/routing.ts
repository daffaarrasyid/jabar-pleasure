/**
 * Road Network Routing Engine for JabarPleasure WebGIS
 * Utilizes OpenStreetMap OSRM (Open Source Routing Machine) Driving Service
 * to follow actual road networks (turn-by-turn geometry) between waypoints.
 */

export interface RoadRouteResult {
  coordinates: [number, number][]; // Array of [lat, lng] points following the road network
  distanceKm: number; // Total road distance in kilometers
  durationMinutes: number; // Estimated driving duration in minutes
  geojson: any; // Raw GeoJSON LineString geometry
}

/**
 * Fetch a driving route following actual roads between two or more waypoints.
 * @param waypoints Array of [latitude, longitude] points (origin, stop 1, stop 2, ..., destination)
 * @returns RoadRouteResult with road coordinates, distance, and duration
 */
export async function fetchRoadRoute(
  waypoints: [number, number][]
): Promise<RoadRouteResult> {
  // If fewer than 2 waypoints, no routing is possible
  if (!waypoints || waypoints.length < 2) {
    return {
      coordinates: waypoints || [],
      distanceKm: 0,
      durationMinutes: 0,
      geojson: null,
    };
  }

  try {
    // OSRM expects coordinates in "longitude,latitude" format separated by semicolons
    const coordinatesString = waypoints
      .map(([lat, lng]) => `${lng},${lat}`)
      .join(';');

    const url = `https://router.project-osrm.org/route/v1/driving/${coordinatesString}?overview=full&geometries=geojson`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`OSRM routing failed with status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
      throw new Error('No route found in OSRM response');
    }

    const route = data.routes[0];
    const geometry = route.geometry; // GeoJSON LineString with [lng, lat] coordinates

    // Convert GeoJSON [lng, lat] coordinates to Leaflet [lat, lng] format
    const leafletCoordinates: [number, number][] = geometry.coordinates.map(
      ([lng, lat]: [number, number]) => [lat, lng]
    );

    const distanceKm = Math.round((route.distance / 1000) * 10) / 10;
    const durationMinutes = Math.round(route.duration / 60);

    return {
      coordinates: leafletCoordinates,
      distanceKm,
      durationMinutes,
      geojson: geometry,
    };
  } catch (error) {
    console.warn(
      'OSRM road routing unavailable or timed out, falling back to direct waypoints:',
      error
    );

    // Graceful fallback: return direct lines between waypoints
    let approxDistance = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      const [lat1, lon1] = waypoints[i];
      const [lat2, lon2] = waypoints[i + 1];
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      approxDistance += 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    return {
      coordinates: waypoints,
      distanceKm: Math.round(approxDistance * 10) / 10,
      durationMinutes: Math.round((approxDistance / 35) * 60), // Assumes 35 km/h avg speed
      geojson: {
        type: 'LineString',
        coordinates: waypoints.map(([lat, lng]) => [lng, lat]),
      },
    };
  }
}

