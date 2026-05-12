"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polygon, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Button } from "antd";

// Fix cho icon mặc định của leaflet bị lỗi khi dùng với Next.js
const icon = L.icon({
  iconUrl: "/marker-icon.png",
  iconRetinaUrl: "/marker-icon-2x.png",
  shadowUrl: "/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapPolygonPickerProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

function ChangeView({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 0) {
      try {
        const bounds = L.latLngBounds(points);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 });
      } catch (e) {
        if (points.length === 1) {
          map.setView(points[0], 18);
        }
      }
    }
  }, [points, map]);
  return null;
}

function LocationMarker({ points, setPoints, disabled }: { points: [number, number][], setPoints: (pts: [number, number][]) => void, disabled?: boolean }) {
  useMapEvents({
    click(e) {
      if (disabled) return;
      setPoints([...points, [e.latlng.lat, e.latlng.lng]]);
    },
  });

  return null;
}

export default function MapPolygonPicker({ value, onChange, disabled }: MapPolygonPickerProps) {
  const [points, setPoints] = useState<[number, number][]>([]);

  // Initialize points from value if provided
  useEffect(() => {
    if (value) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPoints(parsed);
        }
      } catch (e) {
        // Not a valid JSON, maybe a single coordinate "lat,lng"
        const parts = value.split(",");
        if (parts.length === 2) {
          setPoints([[Number(parts[0]), Number(parts[1])]]);
        }
      }
    }
  }, [value]);

  // Update parent when points change
  useEffect(() => {
    if (onChange) {
      onChange(JSON.stringify(points));
    }
  }, [points, onChange]);

  const handleClearLast = () => {
    setPoints(points.slice(0, -1));
  };

  const handleClearAll = () => {
    setPoints([]);
  };

  return (
    <div className="relative w-full h-[350px] border border-[#e1e2e4] rounded-md overflow-hidden z-0">
      <MapContainer
        center={[10.762622, 106.660172]} // Default center to HCM City
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ChangeView points={points} />
        <LocationMarker points={points} setPoints={setPoints} disabled={disabled} />
        
        {points.map((pt, idx) => (
          <Marker key={idx} position={pt} icon={icon} />
        ))}

        {points.length > 1 && (
          <Polygon positions={points} pathOptions={{ color: '#0b57d0', fillColor: '#b2c5ff', fillOpacity: 0.5 }} />
        )}
      </MapContainer>

      {!disabled && (
        <>
          <div className="absolute top-2 right-2 z-[1000] flex gap-2">
            {points.length > 0 && (
              <>
                <Button size="small" onClick={handleClearLast}>
                  Xóa điểm cuối
                </Button>
                <Button size="small" danger onClick={handleClearAll}>
                  Làm lại
                </Button>
              </>
            )}
          </div>

          {points.length === 0 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-white text-[12px] font-medium text-[#111827]">
              Click trên bản đồ để chọn tọa độ các góc của thửa đất
            </div>
          )}
        </>
      )}
    </div>
  );
}
