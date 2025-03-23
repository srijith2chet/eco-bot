
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface MapDisplayProps {
  latitude: number;
  longitude: number;
}

const MapDisplay: React.FC<MapDisplayProps> = ({ latitude, longitude }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // This component is a placeholder for a real map implementation
    // You would typically integrate with a mapping library like Mapbox or Leaflet
    const mapContainer = mapRef.current;
    
    if (mapContainer) {
      // Just a visual placeholder - would be replaced with actual map rendering
      mapContainer.innerHTML = `
        <div class="w-full h-full flex items-center justify-center flex-col">
          <div class="text-center">
            <p class="text-sm text-muted-foreground">Map integration will be added</p>
            <p class="text-primary font-medium mt-2">
              ${latitude.toFixed(6)}, ${longitude.toFixed(6)}
            </p>
          </div>
        </div>
      `;
    }
    
    return () => {
      if (mapContainer) {
        mapContainer.innerHTML = '';
      }
    };
  }, [latitude, longitude]);

  return (
    <div className={cn(
      "glass-card rounded-xl overflow-hidden h-40 relative animate-fade-up animate-delay-400",
      "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))]",
      "from-secondary/30 via-background to-background"
    )}>
      <div ref={mapRef} className="w-full h-full"></div>
    </div>
  );
};

export default MapDisplay;
