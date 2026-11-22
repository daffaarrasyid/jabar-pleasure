'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { lineString, point } from '@turf/helpers';
import { length } from '@turf/length';
import { nearestPointOnLine } from '@turf/nearest-point-on-line';
import { bearing } from '@turf/bearing';
import { along } from '@turf/along';
import { lineSliceAlong } from '@turf/line-slice-along';

const turf = {
  lineString,
  point,
  length,
  nearestPointOnLine,
  bearing,
  along,
  lineSliceAlong,
};
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Play,
  Pause,
  FastForward,
  Compass,
} from 'lucide-react';
import { TimelapseData, TimelapseStop } from '@/lib/api';
import { WEST_JAVA_BOUNDARY_GEOJSON } from './westJavaBoundary';
import TimelapseFloatingCard from './TimelapseFloatingCard';
import TimelapseCelebration from './TimelapseCelebration';
import { ThreeCarMarker } from './ThreeCarMarker';
import { GlbCarMarker, CarMarkerInstance } from './GlbCarMarker';

// Switchable: true uses external .glb 3D car model, false falls back to procedural ThreeCarMarker
export const USE_GLB_CAR_MODEL = true;

export type TimelapseStage =
  | 'INTRO_JABAR'
  | 'ZOOM_CITY'
  | 'ZOOM_START'
  | 'CAR_SPAWN'
  | 'DRIVING_SEGMENT'
  | 'DESTINATION_ARRIVED'
  | 'RETURN_TO_CAR'
  | 'FINISH_CELEBRATION';

interface Timelapse3DPlayerProps {
  data: TimelapseData;
  onBack?: () => void;
  className?: string;
}

const MAP_STYLE_URL = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';

// Configure self-hosted MapLibre worker to prevent Next.js Turbopack chunk failure
if (typeof window !== 'undefined' && typeof maplibregl.setWorkerUrl === 'function') {
  try {
    maplibregl.setWorkerUrl('/maplibre-gl-worker.mjs');
  } catch {
    // Ignore fallback
  }
}

/**
 * Strictly normalizes degrees to [-180, 180] to match MapLibre's internal getBearing()
 * and prevent 360-degree spin flips across South (180 deg) boundary
 */
function normalizeAngle(deg: number): number {
  return ((deg + 180) % 360 + 360) % 360 - 180;
}

export default function Timelapse3DPlayer({
  data,
  onBack,
  className = '',
}: Timelapse3DPlayerProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const carMarkerRef = useRef<maplibregl.Marker | null>(null);
  const threeCarRef = useRef<CarMarkerInstance | null>(null);
  const stopMarkersRef = useRef<maplibregl.Marker[]>([]);

  // Animation RAF refs
  const animFrameIdRef = useRef<number | null>(null);
  const distanceProgressRef = useRef<number>(0);
  const currentStopIndexRef = useRef<number>(0);
  const stopDistancesRef = useRef<number[]>([]);
  const isPlayingRef = useRef<boolean>(true);
  const speedMultiplierRef = useRef<number>(1);
  const lastTimestampRef = useRef<number | null>(null);
  const currentBearingRef = useRef<number>(0);
  const routeLineStringRef = useRef<GeoJSON.Feature<GeoJSON.LineString> | null>(null);
  const totalRouteLengthKmRef = useRef<number>(1);
  const carRoadStopCoordRef = useRef<[number, number] | null>(null);

  // Pending arrivals to defer setState safely outside RAF
  const pendingArrivalRef = useRef<{ stopIdx: number } | null>(null);
  const pendingFinishRef = useRef<boolean>(false);

  // React UI States
  const [stage, setStage] = useState<TimelapseStage>('INTRO_JABAR');
  const [currentStopIndex, setCurrentStopIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [activeStop, setActiveStop] = useState<TimelapseStop | null>(null);
  const [pinScreenPos, setPinScreenPos] = useState<{ x: number; y: number } | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);

  // Total km for celebration
  const totalDistanceKm = React.useMemo(() => {
    if (!data.route_polyline?.coordinates || data.route_polyline.coordinates.length < 2) return 10;
    try {
      const line = turf.lineString(data.route_polyline.coordinates);
      return Math.max(1, Math.round(turf.length(line, { units: 'kilometers' })));
    } catch {
      return 10;
    }
  }, [data.route_polyline]);

  // Pre-calculate stops distance markers along polyline
  useEffect(() => {
    if (!data.route_polyline?.coordinates || data.route_polyline.coordinates.length < 2) {
      return;
    }

    const line = turf.lineString(data.route_polyline.coordinates);
    routeLineStringRef.current = line;
    const totalLen = turf.length(line, { units: 'kilometers' });
    totalRouteLengthKmRef.current = Math.max(0.1, totalLen);

    const stopsDistances: number[] = [];
    data.stops.forEach((stop, idx) => {
      if (idx === 0) {
        stopsDistances.push(0);
      } else {
        try {
          const pt = turf.point(stop.coordinates);
          const snapped = turf.nearestPointOnLine(line, pt, { units: 'kilometers' });
          const dist = snapped.properties.location ?? (idx / data.stops.length) * totalLen;
          stopsDistances.push(Math.min(totalLen, Math.max(0.01, dist)));
        } catch {
          stopsDistances.push((idx / data.stops.length) * totalLen);
        }
      }
    });

    stopDistancesRef.current = stopsDistances;
  }, [data]);

  /**
   * 1. Initialize MapLibre GL Map
   */
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLE_URL,
      center: [107.6098, -6.9175], // Top-down view of West Java center
      zoom: 7.2,
      pitch: 0,
      bearing: 0,
      attributionControl: false,
      maxPitch: 75,
    });

    mapRef.current = map;

    map.on('load', () => {
      setIsMapLoaded(true);

      // Add West Java Boundary Layer
      const boundaryData = data.boundary_geojson || WEST_JAVA_BOUNDARY_GEOJSON;
      map.addSource('west-java-boundary', {
        type: 'geojson',
        data: boundaryData as unknown as GeoJSON.GeoJSON,
      });

      map.addLayer({
        id: 'west-java-fill',
        type: 'fill',
        source: 'west-java-boundary',
        paint: {
          'fill-color': '#4941EC',
          'fill-opacity': 0.08,
        },
      });

      map.addLayer({
        id: 'west-java-border',
        type: 'line',
        source: 'west-java-boundary',
        paint: {
          'line-color': '#4941EC',
          'line-width': 2.5,
          'line-dasharray': [2, 2],
          'line-opacity': 0.7,
        },
      });

      // Add Base Route Polyline (Muted Gray, 0.35 opacity)
      if (data.route_polyline?.coordinates && data.route_polyline.coordinates.length >= 2) {
        map.addSource('route-base', {
          type: 'geojson',
          data: turf.lineString(data.route_polyline.coordinates) as unknown as GeoJSON.GeoJSON,
        });

        map.addLayer({
          id: 'route-base-layer',
          type: 'line',
          source: 'route-base',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#9CA3AF',
            'line-width': 6,
            'line-opacity': 0.35,
          },
        });
      }

      // Add Traveled Progress Route Polyline (#4941EC Primary Blue)
      map.addSource('route-progress', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      map.addLayer({
        id: 'route-progress-layer',
        type: 'line',
        source: 'route-progress',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#4941EC',
          'line-width': 7,
          'line-opacity': 0.95,
        },
      });

      // Add Destination Pin Markers
      const createdMarkers: maplibregl.Marker[] = [];
      data.stops.forEach((stop, idx) => {
        const el = document.createElement('div');
        el.className = 'timelapse-stop-marker transition-all duration-300';
        el.dataset.stopIndex = String(idx);
        Object.assign(el.style, {
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          fontWeight: 'bold',
          fontSize: '12px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
          border: '2.5px solid #FFFFFF',
          cursor: 'pointer',
          backgroundColor: stop.is_start_point ? '#10B981' : '#4941EC',
        });

        el.innerHTML = stop.is_start_point ? '🚩' : `${idx}`;

        const markerCoord =
          idx === 0 && data.route_polyline?.coordinates?.[0]
            ? data.route_polyline.coordinates[0]
            : stop.coordinates;

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat(markerCoord)
          .addTo(map);

        createdMarkers.push(marker);
      });
      stopMarkersRef.current = createdMarkers;

      // Instantiate 3D Car Marker (GLB model or procedural Three.js; stays hidden until CAR_SPAWN)
      const carInstance: CarMarkerInstance = USE_GLB_CAR_MODEL
        ? new GlbCarMarker(92, '/models/low_poly_car.glb')
        : new ThreeCarMarker(88);
      threeCarRef.current = carInstance;
      carInstance.setScale(0);

      const carMarker = new maplibregl.Marker({
        element: carInstance.domElement,
        rotationAlignment: 'map',
        pitchAlignment: 'viewport',
      });
      carMarkerRef.current = carMarker;
    });

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      if (threeCarRef.current) {
        threeCarRef.current.dispose();
        threeCarRef.current = null;
      }
      stopMarkersRef.current.forEach((m) => m.remove());
      stopMarkersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, [data]);

  /**
   * Keep floating card anchored on the map pin when map moves or renders
   */
  const updatePinScreenPos = useCallback(() => {
    const map = mapRef.current;
    if (!map || !activeStop) return;
    const pos = map.project(activeStop.coordinates);
    setPinScreenPos({ x: pos.x, y: pos.y });
  }, [activeStop]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !activeStop) {
      setPinScreenPos(null);
      return;
    }

    updatePinScreenPos();

    map.on('move', updatePinScreenPos);
    map.on('render', updatePinScreenPos);

    return () => {
      map.off('move', updatePinScreenPos);
      map.off('render', updatePinScreenPos);
    };
  }, [activeStop, updatePinScreenPos]);

  /**
   * 2. Orchestration & State Machine Sequences
   */

  // Phase 1 -> Phase 2: INTRO_JABAR -> ZOOM_CITY after 1.2s
  useEffect(() => {
    if (!isMapLoaded || stage !== 'INTRO_JABAR') return;

    const timer = setTimeout(() => {
      setStage('ZOOM_CITY');
    }, 1200);

    return () => clearTimeout(timer);
  }, [isMapLoaded, stage]);

  // Phase 2: ZOOM_CITY -> flyTo city center
  useEffect(() => {
    const map = mapRef.current;
    if (!map || stage !== 'ZOOM_CITY') return;

    map.flyTo({
      center: data.city_center || [107.6098, -6.9175],
      zoom: 11.5,
      pitch: 35,
      bearing: -15,
      duration: 2000,
      essential: true,
    });

    const onMoveEnd = () => {
      map.off('moveend', onMoveEnd);
      setStage('ZOOM_START');
    };

    map.once('moveend', onMoveEnd);
  }, [stage, data.city_center]);

  // Phase 3: ZOOM_START -> flyTo start point with menukik 3D pitch & initial bearing
  useEffect(() => {
    const map = mapRef.current;
    if (!map || stage !== 'ZOOM_START') return;

    const startCoord =
      data.route_polyline?.coordinates?.[0] || data.stops[0]?.coordinates || [106.7972, -6.5950];
    const secondCoord =
      data.route_polyline?.coordinates?.[1] || [startCoord[0] + 0.001, startCoord[1]];
    const initialBearing = normalizeAngle(
      turf.bearing(turf.point(startCoord), turf.point(secondCoord))
    );

    currentBearingRef.current = initialBearing;

    map.flyTo({
      center: startCoord,
      zoom: 16.5,
      pitch: 65,
      bearing: initialBearing,
      duration: 2000,
      essential: true,
    });

    const onMoveEnd = () => {
      map.off('moveend', onMoveEnd);
      setStage('CAR_SPAWN');
    };

    map.once('moveend', onMoveEnd);
  }, [stage, data.stops, data.route_polyline]);

  // Phase 4: CAR_SPAWN -> Spawn 3D Car emerging from beneath the departure point ground
  useEffect(() => {
    if (stage !== 'CAR_SPAWN') return;

    const map = mapRef.current;
    const startCoord =
      data.route_polyline?.coordinates?.[0] || data.stops[0]?.coordinates || [106.7972, -6.5950];

    // Add 3D Car Marker to map at start position
    if (map && carMarkerRef.current) {
      carMarkerRef.current
        .setLngLat(startCoord)
        .setRotation(currentBearingRef.current)
        .addTo(map);
    }

    if (threeCarRef.current) {
      threeCarRef.current.update(currentBearingRef.current, 0, false);
      threeCarRef.current.spawnFromBelow(() => {
        setTimeout(() => {
          setStage('DRIVING_SEGMENT');
        }, 350);
      });
    } else {
      const timer = setTimeout(() => {
        setStage('DRIVING_SEGMENT');
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [stage, data.stops, data.route_polyline]);

  /**
   * Safe bridge to process RAF arrivals and finish outside React render cycle
   */
  useEffect(() => {
    if (stage !== 'DRIVING_SEGMENT') return;

    const interval = setInterval(() => {
      if (pendingFinishRef.current) {
        pendingFinishRef.current = false;
        setStage('FINISH_CELEBRATION');
        return;
      }

      if (pendingArrivalRef.current !== null) {
        const { stopIdx } = pendingArrivalRef.current;
        pendingArrivalRef.current = null;

        const stop = data.stops[stopIdx];
        setCurrentStopIndex(stopIdx);
        setActiveStop(stop || null);
        setStage('DESTINATION_ARRIVED');

        // Update stop pin marker to Teal checkmark
        const targetMarker = stopMarkersRef.current[stopIdx];
        if (targetMarker) {
          const el = targetMarker.getElement();
          el.style.backgroundColor = '#60CE9F';
          el.innerHTML = '✓';
        }

        // Ease camera to center destination & car in middle of viewport
        const map = mapRef.current;
        if (map && stop) {
          map.flyTo({
            center: stop.coordinates,
            zoom: 16.5,
            pitch: 48,
            bearing: currentBearingRef.current,
            offset: [0, 0], // Center destination stop and car in the middle of the screen
            duration: 1000,
            essential: true,
          });
        }
      }
    }, 40);

    return () => clearInterval(interval);
  }, [stage, data.stops]);

  /**
   * 3. Phase 5: DRIVING_SEGMENT -> TravelBoast-Style 60fps RequestAnimationFrame Loop
   */
  const startDrivingLoop = useCallback(() => {
    const map = mapRef.current;
    const line = routeLineStringRef.current;
    if (!map || !line) return;

    const totalLengthKm = totalRouteLengthKmRef.current;
    lastTimestampRef.current = null;

    const animateDriving = (now: number) => {
      if (!isPlayingRef.current) {
        lastTimestampRef.current = null;
        animFrameIdRef.current = requestAnimationFrame(animateDriving);
        return;
      }

      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = now;
      }

      const deltaSeconds = Math.min((now - lastTimestampRef.current) / 1000, 0.08);
      lastTimestampRef.current = now;

      // TravelBoast Fast Timelapse: entire trip completes in ~20 seconds at 1x
      const TIMELAPSE_BASE_SECONDS = 20;
      const speedKmPerSecond =
        (totalLengthKm / TIMELAPSE_BASE_SECONDS) * speedMultiplierRef.current;

      const nextDistance = distanceProgressRef.current + speedKmPerSecond * deltaSeconds;
      distanceProgressRef.current = nextDistance;

      // Check if arrived at next destination stop
      const nextStopIdx = currentStopIndexRef.current + 1;
      const targetStopDist = stopDistancesRef.current[nextStopIdx] ?? totalLengthKm;

      if (nextDistance >= targetStopDist) {
        distanceProgressRef.current = targetStopDist;
        currentStopIndexRef.current = nextStopIdx;

        // Position car on the road line where it arrives
        const roadPoint = turf.along(line, Math.min(totalLengthKm, targetStopDist), { units: 'kilometers' });
        const roadCoord = roadPoint.geometry.coordinates as [number, number];
        carRoadStopCoordRef.current = roadCoord;

        if (carMarkerRef.current) {
          carMarkerRef.current.setLngLat(roadCoord);
          carMarkerRef.current.setRotation(currentBearingRef.current);
        }

        // Keep car parked and visible on the road
        if (threeCarRef.current) {
          threeCarRef.current.setScale(1);
          threeCarRef.current.update(currentBearingRef.current, 0, false);
        }

        if (nextStopIdx >= data.stops.length) {
          pendingFinishRef.current = true;
        } else {
          pendingArrivalRef.current = { stopIdx: nextStopIdx };
        }
        return; // Stop RAF until user advances
      }

      const clampedDist = Math.min(totalLengthKm - 0.001, nextDistance);

      // Current car position along road polyline
      let currentCoord: [number, number];
      try {
        const pt = turf.along(line, clampedDist, { units: 'kilometers' });
        currentCoord = pt.geometry.coordinates as [number, number];
      } catch {
        animFrameIdRef.current = requestAnimationFrame(animateDriving);
        return;
      }

      // Lookahead coordinate for road tangent bearing (32m ahead for sharp responsive cornering)
      const lookaheadDist = Math.min(totalLengthKm - 0.0001, clampedDist + 0.032);
      let targetBearing = currentBearingRef.current;
      try {
        const ahead = turf.along(line, lookaheadDist, { units: 'kilometers' });
        targetBearing = turf.bearing(turf.point(currentCoord), ahead);
      } catch {
        // Keep current bearing
      }

      // Smooth adaptive bearing rotation for hairpin and sharp turns
      const bearingDiff = ((targetBearing - currentBearingRef.current + 540) % 360) - 180;
      const turnRate = Math.min(0.28, 0.18 + Math.abs(bearingDiff) * 0.001);
      currentBearingRef.current = normalizeAngle(currentBearingRef.current + bearingDiff * turnRate);

      // Update 3D car position, rotation, corner banking & wheel spin
      if (carMarkerRef.current) {
        carMarkerRef.current.setLngLat(currentCoord);
        carMarkerRef.current.setRotation(currentBearingRef.current);
      }
      if (threeCarRef.current) {
        threeCarRef.current.update(currentBearingRef.current, deltaSeconds, true);
      }

      // Update traveled progress route line (#4941EC)
      if (clampedDist > 0.005) {
        try {
          const progressLine = turf.lineSliceAlong(line, 0, clampedDist, {
            units: 'kilometers',
          });
          if (progressLine?.geometry?.coordinates?.length >= 2) {
            const progressSource = map.getSource('route-progress') as maplibregl.GeoJSONSource;
            if (progressSource) {
              progressSource.setData(progressLine);
            }
          }
        } catch {
          // Gracefully skip frame
        }
      }

      // Smooth 3D chase camera (pitch 65 degrees, following behind car)
      map.easeTo({
        center: currentCoord,
        bearing: currentBearingRef.current,
        pitch: 65,
        zoom: 16.5,
        duration: 0,
        essential: false,
      });

      animFrameIdRef.current = requestAnimationFrame(animateDriving);
    };

    animFrameIdRef.current = requestAnimationFrame(animateDriving);
  }, [data.stops]);

  useEffect(() => {
    if (stage === 'DRIVING_SEGMENT') {
      startDrivingLoop();
    } else {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    }

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [stage, startDrivingLoop]);

  /**
   * 4. Advance from DESTINATION_ARRIVED: pan camera back to car on the road, then resume driving
   */
  const handleAdvanceFromStop = useCallback(() => {
    setActiveStop(null);
    setPinScreenPos(null);

    // If all stops are completed, celebrate!
    if (currentStopIndexRef.current >= data.stops.length - 1) {
      setStage('FINISH_CELEBRATION');
      return;
    }

    // Direct camera back to the car parked on the road, then resume driving
    setStage('RETURN_TO_CAR');

    const map = mapRef.current;
    const carCoord =
      carRoadStopCoordRef.current ||
      data.stops[currentStopIndexRef.current]?.coordinates ||
      [106.7972, -6.5950];

    if (map) {
      map.flyTo({
        center: carCoord,
        zoom: 16.5,
        pitch: 65,
        bearing: currentBearingRef.current,
        offset: [0, 0],
        duration: 950,
        essential: true,
      });

      const onBackToCar = () => {
        map.off('moveend', onBackToCar);
        setStage('DRIVING_SEGMENT');
      };
      map.once('moveend', onBackToCar);
    } else {
      setStage('DRIVING_SEGMENT');
    }
  }, [data.stops]);

  /**
   * 5. Replay handler: Cleanly hide car before resetting camera to top-down
   */
  const handleReplay = useCallback(() => {
    distanceProgressRef.current = 0;
    currentStopIndexRef.current = 0;
    pendingArrivalRef.current = null;
    pendingFinishRef.current = false;
    setCurrentStopIndex(0);
    setActiveStop(null);
    setPinScreenPos(null);
    isPlayingRef.current = true;
    setIsPlaying(true);

    const map = mapRef.current;

    // Reset stop marker icons
    stopMarkersRef.current.forEach((marker, idx) => {
      const el = marker.getElement();
      el.style.backgroundColor = idx === 0 ? '#10B981' : '#4941EC';
      el.innerHTML = idx === 0 ? '🚩' : `${idx}`;
    });

    // Remove car marker from map before flying back to top-down view
    if (carMarkerRef.current) {
      carMarkerRef.current.remove();
    }
    if (threeCarRef.current) {
      threeCarRef.current.setScale(0);
    }

    if (map) {
      // Clear progress line
      const progressSource = map.getSource('route-progress') as maplibregl.GeoJSONSource;
      if (progressSource) {
        progressSource.setData({ type: 'FeatureCollection', features: [] });
      }

      // Fly camera back to top-down West Java view
      map.flyTo({
        center: [107.6098, -6.9175],
        zoom: 7.2,
        pitch: 0,
        bearing: 0,
        duration: 1800,
        essential: true,
      });

      const onResetEnd = () => {
        map.off('moveend', onResetEnd);
        setStage('INTRO_JABAR');
      };
      map.once('moveend', onResetEnd);
    } else {
      setStage('INTRO_JABAR');
    }
  }, []);

  /**
   * Toggle Play/Pause
   */
  const handleTogglePlay = () => {
    const next = !isPlaying;
    setIsPlaying(next);
    isPlayingRef.current = next;
  };

  /**
   * Cycle Speed Multiplier: 1x -> 2x -> 4x -> 1x
   */
  const handleToggleSpeed = () => {
    let nextSpeed = 1;
    if (speedMultiplier === 1) nextSpeed = 2;
    else if (speedMultiplier === 2) nextSpeed = 4;
    else nextSpeed = 1;

    setSpeedMultiplier(nextSpeed);
    speedMultiplierRef.current = nextSpeed;
  };

  return (
    <div className={`relative w-full h-full min-h-screen bg-[#0B0F19] overflow-hidden ${className}`}>
      {/* 3D MapLibre Canvas Container */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

      {/* Top Floating Glassmorphism HUD Bar */}
      <div className="absolute top-0 left-0 right-0 z-30 p-4 bg-gradient-to-b from-[#0B0F19]/90 via-[#0B0F19]/40 to-transparent flex items-center justify-between select-none">
        {/* Back Button (Min 48x48px Touch Target) */}
        <button
          type="button"
          onClick={onBack}
          aria-label="Kembali"
          className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-lg transition-all cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
        </button>

        {/* Center Trip Title & Stage Info */}
        <div className="flex flex-col items-center max-w-[200px] sm:max-w-xs text-center">
          <span className="text-[10px] font-semibold text-[#60CE9F] bg-[#0F172A]/70 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-[#60CE9F]/30">
            {stage === 'INTRO_JABAR'
              ? 'Peta Jawa Barat'
              : stage === 'ZOOM_CITY'
              ? 'Pusat Kota'
              : stage === 'FINISH_CELEBRATION'
              ? 'Selesai'
              : stage === 'RETURN_TO_CAR'
              ? 'Kembali ke Rute...'
              : `Destinasi ${currentStopIndex + 1}/${data.stops.length}`}
          </span>
          <h1 className="text-white font-bold text-xs sm:text-sm truncate drop-shadow-md mt-0.5">
            {data.title || 'Flyover Perjalanan'}
          </h1>
        </div>

        {/* Speed Multiplier Pill (Min 48x48px Touch Target) */}
        <button
          type="button"
          onClick={handleToggleSpeed}
          aria-label="Kecepatan Animasi"
          className="min-w-[48px] h-12 px-3 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 backdrop-blur-md border border-white/20 text-white flex items-center justify-center gap-1 font-mono text-xs font-bold shadow-lg transition-all cursor-pointer"
        >
          <FastForward className="w-3.5 h-3.5 text-[#60CE9F]" />
          <span>{speedMultiplier}x</span>
        </button>
      </div>

      {/* Floating Center Badge for ZOOM_CITY */}
      <AnimatePresence>
        {stage === 'ZOOM_CITY' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
          >
            <div className="bg-[#4941EC]/90 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full border border-white/30 shadow-xl flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#60CE9F] animate-spin" />
              <span>Menuju Pusat Kota Destinasi</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Card Anchored Over Map Destination Pin */}
      {activeStop && (
        <TimelapseFloatingCard
          key={`stop-card-${activeStop.id}-${currentStopIndex}`}
          stop={activeStop}
          stopIndex={currentStopIndex}
          totalStops={data.stops.length}
          screenPos={pinScreenPos}
          onAdvance={handleAdvanceFromStop}
          autoAdvanceSeconds={5}
        />
      )}

      {/* Bottom Right Floating Play/Pause Controls */}
      {stage === 'DRIVING_SEGMENT' && (
        <div className="absolute bottom-6 right-4 z-30 flex flex-col items-center gap-2 select-none">
          <button
            type="button"
            onClick={handleTogglePlay}
            aria-label={isPlaying ? 'Jeda Animasi' : 'Lanjutkan Animasi'}
            className="w-12 h-12 rounded-full bg-[#4941EC] hover:bg-[#3D35D9] active:scale-95 text-white flex items-center justify-center shadow-xl shadow-[#4941EC]/40 border border-white/30 transition-all cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-white" />
            ) : (
              <Play className="w-5 h-5 fill-white ml-0.5" />
            )}
          </button>
        </div>
      )}

      {/* Celebration Modal on Final Arrival */}
      {stage === 'FINISH_CELEBRATION' && (
        <TimelapseCelebration
          tripTitle={data.title}
          totalStops={data.stops.length}
          totalDistanceKm={totalDistanceKm}
          onReplay={handleReplay}
          onClose={onBack || (() => setStage('INTRO_JABAR'))}
        />
      )}
    </div>
  );
}
