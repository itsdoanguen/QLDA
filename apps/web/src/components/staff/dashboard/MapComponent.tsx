'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { api } from '@/utils/api';

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
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

export default function MapComponent({ record }: { record: any }) {
  const [coords, setCoords] = useState<[number, number][]>([]);
  const [loading, setLoading] = useState(false);

  const parseCoordinates = (gpsString: string): [number, number][] => {
    if (!gpsString) return [];
    
    const cleaned = gpsString.trim();
    // Check if it is a simple "lat, lng" string
    if (!cleaned.startsWith('[')) {
      const parts = cleaned.split(',');
      if (parts.length === 2) {
        const lat = parseFloat(parts[0].trim());
        const lng = parseFloat(parts[1].trim());
        if (!isNaN(lat) && !isNaN(lng)) {
          return [[lat, lng]];
        }
      }
      return [];
    }

    try {
      const parsed = JSON.parse(cleaned);
      if (!Array.isArray(parsed)) return [];
      
      return parsed.map((p: any): [number, number] | null => {
        // Format: {lat, lng}
        if (p && typeof p.lat === 'number' && typeof p.lng === 'number') {
          return [p.lat, p.lng];
        }
        // Format: [lat, lng]
        if (Array.isArray(p) && p.length === 2 && typeof p[0] === 'number' && typeof p[1] === 'number') {
          return [p[0], p[1]];
        }
        return null;
      }).filter((p): p is [number, number] => p !== null);
    } catch (e) {
      console.error("Failed to parse coordinates", e);
      return [];
    }
  };

  useEffect(() => {
    const loadGps = async () => {
      if (!record?.id) {
        setCoords([]);
        return;
      }

      // If record already has gpsCoordinates, use them
      if (record.gpsCoordinates) {
        setCoords(parseCoordinates(record.gpsCoordinates));
        return;
      }

      // Otherwise, fetch from the new endpoint
      try {
        setLoading(true);
        const res = await api.get(`/land-records/${record.id}/gps`);
        if (res.data?.gpsCoordinates) {
          setCoords(parseCoordinates(res.data.gpsCoordinates));
        } else {
          setCoords([]);
        }
      } catch (error) {
        console.error("Failed to fetch GPS coordinates", error);
        setCoords([]);
      } finally {
        setLoading(false);
      }
    };

    loadGps();
  }, [record?.id, record?.gpsCoordinates]);

  const defaultCenter: [number, number] = [10.762622, 106.660172];
  const position: [number, number] = coords.length > 0 ? coords[0] : defaultCenter;

  return (
    <div className="h-full w-full relative">
      {loading && (
        <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
          <div className="bg-white px-4 py-2 rounded-full shadow-md text-[12px] font-medium text-[#0052cc]">
            Đang tải tọa độ...
          </div>
        </div>
      )}
      <MapContainer 
        center={position} 
        zoom={coords.length > 0 ? 18 : 15} 
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <ChangeView center={position} zoom={coords.length > 0 ? 18 : 15} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {coords.length > 1 ? (
          <Polygon 
            positions={coords}
            pathOptions={{ color: '#0052cc', fillColor: '#0052cc', fillOpacity: 0.3, weight: 3 }}
          />
        ) : coords.length === 1 ? (
          <Marker position={coords[0]} icon={icon}>
            <Popup>
              {record?.address || "Vị trí thửa đất"}
            </Popup>
          </Marker>
        ) : (
          <Marker position={defaultCenter} icon={icon}>
            <Popup>
              Vị trí mặc định (Chưa có tọa độ)
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
