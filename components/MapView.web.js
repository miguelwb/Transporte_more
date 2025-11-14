import React, { useEffect, useRef, useState } from 'react';

function ensureLeafletCSS() {
  if (typeof document === 'undefined') return;
  const id = 'leaflet-css';
  if (!document.getElementById(id)) {
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.crossOrigin = '';
    document.head.appendChild(link);
  }
}

export default function MapView({ style, initialRegion, onPress, children }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersLayerRef = useRef(null);
  const tileLayerRef = useRef(null);
  const LRef = useRef(null);
  const [leafletReady, setLeafletReady] = useState(false);
  const providerIndexRef = useRef(0);
  const tileErrorCountRef = useRef(0);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    ensureLeafletCSS();

    const lat = initialRegion?.latitude ?? 0;
    const lng = initialRegion?.longitude ?? 0;
    const zoom = initialRegion?.latitudeDelta
      ? Math.max(1, Math.round(14 / initialRegion.latitudeDelta))
      : 14;

    let cancelled = false;
    const onReady = (L) => {
      if (cancelled) return;
      LRef.current = L;
      setLeafletReady(true);
      if (!mapRef.current && containerRef.current) {
        mapRef.current = L.map(containerRef.current, {
          zoomControl: true,
        }).setView([lat, lng], zoom);

        const providers = [
          { url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: '&copy; OpenStreetMap contributors' },
          { url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', attribution: '&copy; OpenStreetMap contributors, HOT' },
          { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: '&copy; OpenStreetMap contributors' },
        ];

        const attachTiles = (idx = 0) => {
          providerIndexRef.current = idx;
          const p = providers[idx] || providers[0];
          if (tileLayerRef.current) {
            tileLayerRef.current.remove();
          }
          tileErrorCountRef.current = 0;
          tileLayerRef.current = L.tileLayer(p.url, {
            attribution: p.attribution,
            maxZoom: 19,
            crossOrigin: true,
          }).addTo(mapRef.current);

          tileLayerRef.current.on('tileerror', (e) => {
            tileErrorCountRef.current += 1;
            const count = tileErrorCountRef.current;
            // Se muitos erros ocorrerem, alterna para próximo provedor
            if (count >= 3) {
              const next = (providerIndexRef.current + 1) % providers.length;
              console.warn(`[map] falha ao carregar tiles (x${count}). Alternando provedor para índice ${next}.`);
              attachTiles(next);
            } else {
              console.warn('[map] tileerror:', e?.error || e);
            }
          });
        };

        attachTiles(0);

        markersLayerRef.current = L.layerGroup().addTo(mapRef.current);

        mapRef.current.on('click', (e) => {
          if (typeof onPress === 'function') {
            onPress({ nativeEvent: { coordinate: { latitude: e.latlng.lat, longitude: e.latlng.lng } } });
          }
        });
      }
    };

    const existing = typeof globalThis !== 'undefined' && globalThis.L ? globalThis.L : null;
    if (existing) {
      onReady(existing);
    } else {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.crossOrigin = '';
      script.onload = () => onReady(globalThis.L);
      document.body.appendChild(script);
    }

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = markersLayerRef.current;
    const L = LRef.current;
    if (!map || !layer || !L || !leafletReady) return;
    layer.clearLayers();

    const kids = React.Children.toArray(children);
    const latLngs = [];
    kids.forEach((child) => {
      const type = child?.type;
      const isMarker = type && type.displayName === 'WebMarker';
      if (isMarker) {
        const coord = child.props?.coordinate;
        if (coord && typeof coord.latitude === 'number' && typeof coord.longitude === 'number') {
          const ll = L.latLng(coord.latitude, coord.longitude);
          L.marker(ll).addTo(layer);
          latLngs.push(ll);
        }
      }
    });

    // Se houver marcadores, ajustar o mapa para mostrar todos
    if (latLngs.length > 0) {
      const bounds = L.latLngBounds(latLngs);
      try {
        map.fitBounds(bounds, { padding: [20, 20] });
      } catch (e) {
        console.warn('[map] falha ao ajustar bounds:', e?.message || e);
      }
    }
  }, [children, leafletReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const lat = initialRegion?.latitude ?? 0;
    const lng = initialRegion?.longitude ?? 0;
    const zoom = initialRegion?.latitudeDelta
      ? Math.max(1, Math.round(14 / initialRegion.latitudeDelta))
      : map.getZoom();
    map.setView([lat, lng], zoom);
  }, [initialRegion?.latitude, initialRegion?.longitude, initialRegion?.latitudeDelta]);

  return <div style={style}><div ref={containerRef} style={{ width: '100%', height: '100%' }} /></div>;
}

export const Marker = ({ children }) => null;
Marker.displayName = 'WebMarker';
export const Callout = ({ children }) => null;