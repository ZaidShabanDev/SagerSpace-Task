import Drone from '@/assets/drone.svg?react';
import type { DroneData, DroneJourney, DronePosition } from '@/types';
import { List } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useCallback, useEffect, useRef, useState, type JSX } from 'react';
import { createRoot } from 'react-dom/client';
import io from 'socket.io-client';
import { DroneSidebar } from './droneSidebar';

export function MapComponent(): JSX.Element {
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const pathSourcesRef = useRef<Map<string, string>>(new Map()); // Track path sources by registration
  const [allDroneJourneys, setAllDroneJourneys] = useState<Map<string, DroneJourney>>(new Map());
  const [redDroneCount, setRedDroneCount] = useState(0);
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedDroneId, setSelectedDroneId] = useState<string | null>(null);

  const handleDroneSelect = useCallback((registrationId: string, coordinates: [number, number]) => {
    setSelectedDroneId(registrationId);
    if (map.current) {
      map.current.flyTo({
        center: coordinates,
        zoom: 15,
        duration: 1000,
      });
    }
  }, []);

  const handleMarkerClick = useCallback((registrationId: string) => {
    setSelectedDroneId(registrationId);
  }, []);

  const togglePanel = useCallback(() => {
    setPanelOpen((prev) => !prev);
  }, []);

  const initializeMap = useCallback((container: HTMLDivElement | null) => {
    if (!container || map.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

    map.current = new mapboxgl.Map({
      container,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [35.9106, 31.9539],
      zoom: 10.12,
    });
  }, []);

  const getDroneColor = useCallback((registration: string): { background: string; border: string } => {
    const isGreen = registration.split('-')[1]?.startsWith('B');
    return {
      background: isGreen ? 'rgba(36,255,0)' : 'rgba(255,0,15)',
      border: isGreen ? '#24ff00' : '#FF000f',
    };
  }, []);

  const formatFlightTime = useCallback((journey: DroneJourney): string => {
    if (journey.positions.length < 2) return '00:00:00';

    const startTime = journey.positions[0].timestamp;
    const currentTime = journey.currentPosition?.timestamp || Date.now();
    const durationMs = currentTime - startTime;

    const hours = Math.floor(durationMs / 3600000);
    const minutes = Math.floor((durationMs % 3600000) / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const createDroneMarker = useCallback(
    (journey: DroneJourney) => {
      if (!map.current || !journey.currentPosition) return null;

      const { currentPosition, registrationId } = journey;
      const coordinates = [currentPosition.lng, currentPosition.lat] as [number, number];
      const colors = getDroneColor(registrationId);
      const flightTime = formatFlightTime(journey);

      // Create a div element for the marker
      const markerElement = document.createElement('div');
      markerElement.style.width = '32px';
      markerElement.style.height = '32px';
      markerElement.style.cursor = 'pointer';

      // Create a React root and render the drone SVG with rotation based on yaw
      const root = createRoot(markerElement);
      root.render(
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: colors.background,
            filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5))',
            opacity: currentPosition.altitude > 0 ? '1' : '0.6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            position: 'relative',
            // Rotate the entire marker to face yaw direction
            transform: `rotate(${currentPosition.yaw}deg)`,
            transformOrigin: 'center',
          }}
        >
          <Drone width={20} height={20} />

          <div
            style={{
              position: 'absolute',
              top: '-8px',
              left: '50%',
              width: '0',
              height: '0',
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderBottom: `12px solid ${colors.border}`,
              transform: 'translateX(-50%)',
              transformOrigin: 'center',
            }}
          />
        </div>
      );

      // Create the marker
      const marker = new mapboxgl.Marker({
        element: markerElement,
        anchor: 'center',
      })
        .setLngLat(coordinates)
        .addTo(map.current);

      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        closeOnClick: true,
      }).setHTML(`
        <div style="padding: 6px; min-width: 140px; font-family: system-ui;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <h3 style="margin: 0; color: #fff; font-size: 16px; font-weight: 600;">
              ${currentPosition.name}
            </h3>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-family: system-ui; margin-bottom: 2px;">
            <div>
              <div style="font-size: 11px; color: #fff; margin-bottom: 2px;">Altitude</div>
              <div style="font-size: 12px; color: #fbfbfe; font-weight: 500;">${currentPosition.altitude} m</div>
            </div>
            <div>
              <div style="font-size: 11px; color: #fff; margin-bottom: 2px;">Flight Time</div>
              <div style="font-size: 12px; color: #fbfbfe; font-weight: 500;">${flightTime}</div>
            </div>
          </div>
        </div>
    `);

      marker.setPopup(popup);

      marker.getElement().addEventListener('click', () => {
        handleMarkerClick(registrationId);
      });

      return marker;
    },
    [getDroneColor]
  );

  const updateDronePaths = useCallback(() => {
    if (!map.current) return;

    allDroneJourneys.forEach((journey, registrationId) => {
      if (journey.positions.length < 2) return; // Need at least 2 points for a line

      const sourceId = `drone-path-${registrationId}`;
      const layerId = `drone-path-layer-${registrationId}`;
      const colors = getDroneColor(registrationId);

      // Create coordinates array for the path
      const coordinates = journey.positions.map((pos) => [pos.lng, pos.lat]);

      const pathData = {
        type: 'Feature' as const,
        properties: {},
        geometry: {
          type: 'LineString' as const,
          coordinates: coordinates,
        },
      };

      // Check if source exists, update or create
      if (!map.current) return;

      if (map.current.getSource(sourceId)) {
        // Update existing source
        const source = map.current.getSource(sourceId) as mapboxgl.GeoJSONSource;
        source.setData(pathData);
      } else {
        // Create new source and layer
        map.current.addSource(sourceId, {
          type: 'geojson',
          data: pathData,
        });

        map.current.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': colors.border,
            'line-width': 3,
            'line-opacity': 0.7,
          },
        });

        pathSourcesRef.current.set(registrationId, sourceId);
      }
    });
  }, [allDroneJourneys, getDroneColor]);

  const updateDroneMarkers = useCallback(() => {
    if (!map.current) return;

    const currentJourneys = Array.from(allDroneJourneys.values());
    const currentMarkers = markersRef.current;

    // Remove markers for drones that no longer exist
    currentMarkers.forEach((marker, registrationId) => {
      if (!allDroneJourneys.has(registrationId)) {
        marker.remove();
        currentMarkers.delete(registrationId);

        // Remove path layer and source
        const sourceId = pathSourcesRef.current.get(registrationId);
        if (!map.current) return;

        if (sourceId && map.current.getLayer(`drone-path-layer-${registrationId}`)) {
          map.current.removeLayer(`drone-path-layer-${registrationId}`);
          map.current.removeSource(sourceId);
          pathSourcesRef.current.delete(registrationId);
        }
      }
    });

    // Add or update markers for current drone journeys
    currentJourneys.forEach((journey) => {
      if (!journey.currentPosition) return;

      const registrationId = journey.registrationId;
      const existingMarker = currentMarkers.get(registrationId);
      const coordinates = [journey.currentPosition.lng, journey.currentPosition.lat] as [number, number];
      const flightTime = formatFlightTime(journey);

      if (existingMarker) {
        // Update existing marker position
        existingMarker.setLngLat(coordinates);

        // Update marker rotation for yaw direction
        const markerElement = existingMarker.getElement();
        const innerCircle = markerElement.querySelector('div');
        if (innerCircle) {
          innerCircle.style.transform = `rotate(${journey.currentPosition.yaw}deg)`;
        }

        // Update popup content
        const popup = existingMarker.getPopup();
        if (popup) {
          popup.setHTML(`
            <div style="padding: 6px; min-width: 140px; font-family: system-ui;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                <h3 style="margin: 0; color: #fff; font-size: 16px; font-weight: 600;">
                  ${journey.currentPosition.name}
                </h3>
              </div>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-family: system-ui; margin-bottom: 2px;">
                <div>
                  <div style="font-size: 11px; color: #fff; margin-bottom: 2px;">Altitude</div>
                  <div style="font-size: 12px; color: #fbfbfe; font-weight: 500;">${journey.currentPosition.altitude} m</div>
                </div>
                <div>
                  <div style="font-size: 11px; color: #fff; margin-bottom: 2px;">Flight Time</div>
                  <div style="font-size: 12px; color: #fbfbfe; font-weight: 500;">${flightTime}</div>
                </div>
              </div>
            </div>
          `);
        }
      } else {
        // Create new marker
        const newMarker = createDroneMarker(journey);
        if (newMarker) {
          currentMarkers.set(registrationId, newMarker);
        }
      }
    });
  }, [allDroneJourneys, createDroneMarker]);

  // Update markers and paths whenever drone data changes
  useEffect(() => {
    updateDroneMarkers();
    updateDronePaths();
  }, [updateDroneMarkers, updateDronePaths]);

  // Listen for individual drone updates via WebSocket
  useEffect(() => {
    const socket = io('http://localhost:9013', {
      transports: ['polling'],
    });

    socket.on('message', (data: DroneData) => {
      if (data.features && data.features.length > 0) {
        // Process each drone feature and add to journey tracking
        setAllDroneJourneys((prev) => {
          const newJourneysMap = new Map(prev);

          data.features.forEach((droneFeature) => {
            const registrationId = droneFeature.properties.registration;
            const newPosition: DronePosition = {
              lat: droneFeature.geometry.coordinates[1],
              lng: droneFeature.geometry.coordinates[0],
              altitude: droneFeature.properties.altitude,
              yaw: droneFeature.properties.yaw,
              timestamp: Date.now(),
              name: droneFeature.properties.Name,
              pilot: droneFeature.properties.pilot,
              organization: droneFeature.properties.organization,
              serial: droneFeature.properties.serial,
            };

            // Only process drones with altitude > 0
            if (newPosition.altitude === 0) {
              if (newJourneysMap.has(registrationId)) {
                newJourneysMap.delete(registrationId);
              }
              return;
            }

            if (newJourneysMap.has(registrationId)) {
              // Update existing journey
              const existingJourney = newJourneysMap.get(registrationId)!;
              const updatedJourney: DroneJourney = {
                ...existingJourney,
                positions: [...existingJourney.positions, newPosition],
                currentPosition: newPosition,
                lastUpdated: Date.now(),
                serial: droneFeature.properties.serial,
                pilot: droneFeature.properties.pilot,
                organization: droneFeature.properties.organization,
              };
              newJourneysMap.set(registrationId, updatedJourney);
            } else {
              // Create new journey
              const newJourney: DroneJourney = {
                registrationId,
                positions: [newPosition],
                currentPosition: newPosition,
                lastUpdated: Date.now(),
                serial: droneFeature.properties.serial,
                pilot: droneFeature.properties.pilot,
                organization: droneFeature.properties.organization,
              };
              newJourneysMap.set(registrationId, newJourney);
            }
          });

          return newJourneysMap;
        });
      }
    });

    // Clean up old drone journeys (remove journeys not updated in 30 seconds)
    const cleanupInterval = setInterval(() => {
      const thirtySecondsAgo = Date.now() - 30000;

      setAllDroneJourneys((prev) => {
        const updatedMap = new Map();

        prev.forEach((journey, registrationId) => {
          if (journey.lastUpdated > thirtySecondsAgo) {
            updatedMap.set(registrationId, journey);
          }
        });

        return updatedMap;
      });
    }, 10000); // Run cleanup every 10 seconds

    return () => {
      clearInterval(cleanupInterval);

      // Clean up all markers and paths
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();

      // Clean up all path layers and sources
      pathSourcesRef.current.forEach((sourceId, registrationId) => {
        if (map.current && map.current.getLayer(`drone-path-layer-${registrationId}`)) {
          map.current.removeLayer(`drone-path-layer-${registrationId}`);
          map.current.removeSource(sourceId);
        }
      });
      pathSourcesRef.current.clear();

      socket.close();
    };
  }, []);

  // Clean up markers, paths and map on component unmount
  useEffect(() => {
    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();

      pathSourcesRef.current.forEach((sourceId, registrationId) => {
        if (map.current && map.current.getLayer(`drone-path-layer-${registrationId}`)) {
          map.current.removeLayer(`drone-path-layer-${registrationId}`);
          map.current.removeSource(sourceId);
        }
      });
      pathSourcesRef.current.clear();

      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update red drone count whenever journeys change
  useEffect(() => {
    const redCount = Array.from(allDroneJourneys.values()).filter((journey) => {
      if (!journey.currentPosition || journey.currentPosition.altitude === 0) return false;
      const registrationParts = journey.registrationId.split('-');
      return !registrationParts[1]?.startsWith('B');
    }).length;

    setRedDroneCount(redCount);
  }, [allDroneJourneys]);

  return (
    <>
      <div id="map-container" ref={initializeMap} />

      {/* Drone List Panel */}
      <DroneSidebar
        drones={allDroneJourneys}
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        selectedDroneId={selectedDroneId}
        onDroneSelect={handleDroneSelect}
      />

      {/* Panel Toggle Button */}
      {!panelOpen && (
        <button
          onClick={togglePanel}
          className="absolute bottom-4 left-4 z-[999] flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-none bg-black/90 text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all duration-200 ease-in-out hover:scale-105 hover:bg-neutral-700"
        >
          <List size={20} />
        </button>
      )}

      {/* Red drone counter */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-[10px] bg-[rgb(217,217,217)] px-3 py-2 font-sans text-sm font-semibold text-black shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
        <span className="flex h-[25px] w-[25px] items-center justify-center rounded-full bg-[#1F2327] text-base text-white">
          {redDroneCount}
        </span>
        Drone Flying
      </div>
    </>
  );
}
