'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the map component with SSR disabled
const MapComponent = dynamic(() => import('./MapComponent'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-surface-container">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
});

export default function MapContext() {
  return (
    <div className="col-span-12 lg:col-span-4 bg-white border border-outline-variant rounded overflow-hidden flex flex-col min-h-[400px]">
      <div className="p-lg">
        <h3 className="font-h3 text-h3 text-on-surface mb-xs">Vị trí hồ sơ đang xử lý</h3>
        <p className="text-body-md text-secondary">Lô đất HS-2024-0891</p>
      </div>
      <div className="flex-1 relative z-0">
        <MapComponent />
        
        {/* Radar Ping Overlay Effect (Optional) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center animate-ping">
            <div className="w-4 h-4 bg-primary rounded-full shadow-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
