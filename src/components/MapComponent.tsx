import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useCallback, useEffect, useRef, type JSX } from 'react';

export function MapComponent(): JSX.Element {
  const map = useRef<mapboxgl.Map | null>(null);

  const initializeMap = useCallback((container: HTMLDivElement | null) => {
    if (!container || map.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

    map.current = new mapboxgl.Map({
      container,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-74.0242, 40.6941],
      zoom: 10.12,
    });
  }, []);

  useEffect(() => {
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  return <div id="map-container" ref={initializeMap} />;
}
