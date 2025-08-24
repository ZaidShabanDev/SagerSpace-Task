import Drone from '@/assets/drone.svg?react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useCallback, useEffect, useRef, useState, type JSX } from 'react';
import { createRoot } from 'react-dom/client';
import io from 'socket.io-client';

interface DroneData {
  type: string;
  features: Array<{
    type: string;
    properties: {
      serial: string;
      registration: string;
      Name: string;
      altitude: number;
      pilot: string;
      organization: string;
      yaw: number;
    };
    geometry: {
      coordinates: [number, number];
      type: string;
    };
  }>;
}

interface DroneWithTimestamp {
  type: string;
  properties: {
    serial: string;
    registration: string;
    Name: string;
    altitude: number;
    pilot: string;
    organization: string;
    yaw: number;
  };
  geometry: {
    coordinates: [number, number];
    type: string;
  };
  lastUpdated: number;
}

export function MapComponent(): JSX.Element {
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const [allDronesData, setAllDronesData] = useState<Map<string, DroneWithTimestamp>>(new Map());

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

  const createDroneMarker = useCallback((drone: DroneWithTimestamp) => {
    if (!map.current) return null;

    const coordinates = drone.geometry.coordinates as [number, number];
    const { properties } = drone;

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
          backgroundColor: properties.registration.split('-')[1]?.startsWith('B')
            ? 'rgba(16, 185, 129, 0.8)'
            : 'rgba(239, 68, 68, 0.8)',
          filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5))',
          opacity: properties.altitude > 0 ? '1' : '0.6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative', // Make sure the container is positioned
        }}
      >
        <Drone width={20} height={20} />

        {/* Arrow that moves around the edge pointing in yaw direction */}
        <div
          style={{
            position: 'absolute',
            width: '10px',
            height: '10px',
            color: properties.registration.split('-')[1]?.startsWith('B')
              ? 'rgba(16, 185, 129, 0.8)'
              : 'rgba(239, 68, 68, 0.8)',
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderBottom: '12px solid ',
            // Calculate position around the circle's edge
            left: `${20 + 18 * Math.cos(((properties.yaw - 90) * Math.PI) / 180)}px`,
            top: `${20 + 18 * Math.sin(((properties.yaw - 90) * Math.PI) / 180)}px`,
            // Transform to center the arrow and point outward
            transform: `translate(-50%, -50%) rotate(${properties.yaw}deg)`,
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
      <div style="padding: 12px; min-width: 240px; font-family: system-ui;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <h3 style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 600;">
            ${properties.Name}
          </h3>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
          <div>
            <div style="font-size: 11px; color: #6b7280; margin-bottom: 2px;">Altitude</div>
            <div style="font-size: 12px; color: #374151; font-weight: 500;">${properties.altitude}m</div>
          </div>
          <div>
            <div style="font-size: 11px; color: #6b7280; margin-bottom: 2px;">Registration #</div>
            <div style="font-size: 12px; color: #374151; font-weight: 500;">${properties.registration}</div>
          </div>
        </div>
      </div>
    `);

    marker.setPopup(popup);
    return marker;
  }, []);

  const updateDroneMarkers = useCallback(() => {
    if (!map.current) return;

    const currentDrones = Array.from(allDronesData.values());
    const currentMarkers = markersRef.current;

    // Remove markers for drones that no longer exist
    currentMarkers.forEach((marker, serial) => {
      if (!allDronesData.has(serial)) {
        marker.remove();
        currentMarkers.delete(serial);
      }
    });

    // Add or update markers for current drones
    currentDrones.forEach((drone) => {
      const serial = drone.properties.serial;
      const existingMarker = currentMarkers.get(serial);

      if (existingMarker) {
        // Update existing marker position and popup
        const coordinates = drone.geometry.coordinates as [number, number];
        existingMarker.setLngLat(coordinates);

        // Update the marker element with new rotation
        const markerElement = existingMarker.getElement();
        const svgElement = markerElement.querySelector('svg');
        if (svgElement) {
          svgElement.style.transform = `rotate(${drone.properties.yaw || 0}deg)`;
          svgElement.style.opacity = drone.properties.altitude > 0 ? '1' : '0.6';
        }
      } else {
        // Create new marker
        const newMarker = createDroneMarker(drone);
        if (newMarker) {
          currentMarkers.set(serial, newMarker);
        }
      }
    });
  }, [allDronesData, createDroneMarker]);

  // Update markers whenever drone data changes
  useEffect(() => {
    updateDroneMarkers();
  }, [updateDroneMarkers]);

  useEffect(() => {
    const socket = io('http://localhost:9013', {
      transports: ['polling'],
    });

    // Listen for individual drone updates via WebSocket
    socket.on('message', (data: DroneData) => {
      if (data.features && data.features.length > 0) {
        // Process each drone feature and add/update in the collection
        setAllDronesData((prev) => {
          const newDronesMap = new Map(prev);

          data.features.forEach((droneFeature) => {
            const serial = droneFeature.properties.serial;
            // Add timestamp to track when we last received data for this drone
            const droneWithTimestamp: DroneWithTimestamp = {
              ...droneFeature,
              lastUpdated: Date.now(),
            };
            newDronesMap.set(serial, droneWithTimestamp);
          });

          return newDronesMap;
        });
      }
    });

    // Clean up old drone data (remove drones not updated in 30 seconds)
    const cleanupInterval = setInterval(() => {
      const thirtySecondsAgo = Date.now() - 30000;

      setAllDronesData((prev) => {
        const updatedMap = new Map();

        prev.forEach((drone, serial) => {
          if (drone.lastUpdated > thirtySecondsAgo) {
            updatedMap.set(serial, drone);
          }
        });

        return updatedMap;
      });
    }, 10000); // Run cleanup every 10 seconds

    return () => {
      clearInterval(cleanupInterval);

      // Clean up all markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();

      socket.close();
    };
  }, []);

  useEffect(() => {
    return () => {
      // Clean up markers and map on component unmount
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();
      map.current?.remove();
      map.current = null;
    };
  }, []);

  return <div id="map-container" ref={initializeMap} />;
}
