'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with Next.js
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle auto-panning when coordinates change
function ChangeView({ center, zoom }: any) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function MapComponent({ record }: { record: any }) {
  let position: [number, number] = [10.762622, 106.660172];
  let polygonData: any = null;

  if (record?.gpsCoordinates) {
    try {
      const coords = JSON.parse(record.gpsCoordinates);
      if (Array.isArray(coords) && coords.length > 0) {
        const firstPoint = coords[0];
        if (typeof firstPoint.lat === 'number' && typeof firstPoint.lng === 'number') {
          polygonData = coords;
          position = [firstPoint.lat, firstPoint.lng];
        }
      }
    } catch (e) {
      console.error("Failed to parse coordinates", e);
    }
  }

  return (
    <MapContainer 
      center={position} 
      zoom={17} 
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%', zIndex: 0 }}
    >
      <ChangeView center={position} zoom={17} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {polygonData ? (
        <Polygon 
          positions={polygonData
            .filter((p: any) => typeof p.lat === 'number' && typeof p.lng === 'number')
            .map((p: any) => [p.lat, p.lng])}
          pathOptions={{ color: '#0052cc', fillColor: '#0052cc', fillOpacity: 0.3 }}
        />
      ) : (
        <Marker position={position} icon={icon}>
          <Popup>
            {record?.address || "Vị trí mặc định"}
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
