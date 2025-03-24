
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { cn } from '@/lib/utils';

interface MapDisplayProps {
  latitude: number;
  longitude: number;
  plasticLevel?: 'low' | 'medium' | 'high';
  className?: string;
}

const MapDisplay: React.FC<MapDisplayProps> = ({ 
  latitude, 
  longitude, 
  plasticLevel = 'low',
  className 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  // Define colors based on plastic level
  const getMarkerColor = () => {
    switch (plasticLevel) {
      case 'high':
        return '#ea384c'; // Red
      case 'medium':
        return '#F97316'; // Orange
      case 'low':
        return '#4ade80'; // Green
      default:
        return '#4ade80'; // Default to green
    }
  };

  const handleMapError = () => {
    // Fallback if map fails to load
    if (mapRef.current) {
      mapRef.current.innerHTML = `
        <div class="w-full h-full flex items-center justify-center flex-col">
          <div class="text-center">
            <p class="text-sm text-muted-foreground">Map could not be loaded</p>
            <p class="text-primary font-medium mt-2">
              ${latitude.toFixed(6)}, ${longitude.toFixed(6)}
            </p>
          </div>
        </div>
      `;
    }
  };

  useEffect(() => {
    if (!mapRef.current) return;

    try {
      // Create map if it doesn't exist
      if (!mapInstance.current) {
        // Initialize map
        mapInstance.current = L.map(mapRef.current, {
          attributionControl: false,
          zoomControl: false,
        }).setView([latitude, longitude], 13);

        // Add a tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
        }).addTo(mapInstance.current);

        // Add zoom control to the top-right corner
        L.control.zoom({
          position: 'topright'
        }).addTo(mapInstance.current);

        // Create a custom icon for the marker
        const markerColor = getMarkerColor();
        
        // Add a marker at the location
        const marker = L.circleMarker([latitude, longitude], {
          radius: 8,
          fillColor: markerColor,
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(mapInstance.current);
        
        // Add a pulse effect around the marker (using CSS)
        const pulseIcon = L.divIcon({
          html: `<div class="pulse-icon" style="background-color: ${markerColor}"></div>`,
          className: 'pulse-icon-container',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });
        
        L.marker([latitude, longitude], { icon: pulseIcon }).addTo(mapInstance.current);
      } else {
        // Update map view if it already exists
        mapInstance.current.setView([latitude, longitude], 13);
      }
    } catch (error) {
      console.error('Error initializing map:', error);
      handleMapError();
    }

    // Cleanup function
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [latitude, longitude, plasticLevel]);

  return (
    <div className={cn(
      "glass-card rounded-xl overflow-hidden h-40 relative animate-fade-up animate-delay-400",
      "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))]",
      "from-secondary/30 via-background to-background",
      className
    )}>
      <div ref={mapRef} className="w-full h-full"></div>
      <style>
        {`
        .pulse-icon-container {
          background: transparent;
        }
        
        .pulse-icon {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          position: absolute;
          transform: translate(-50%, -50%);
        }
        
        .pulse-icon:before {
          content: '';
          position: absolute;
          width: 300%;
          height: 300%;
          border-radius: 50%;
          background-color: inherit;
          opacity: 0.8;
          left: -100%;
          top: -100%;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% {
            transform: scale(0.3);
            opacity: 0.8;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
        `}
      </style>
    </div>
  );
};

export default MapDisplay;
