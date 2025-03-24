import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
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
  const mapInstance = useRef<mapboxgl.Map | null>(null);

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
    // Get access token from environment variable
    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
    
    // If no token provided, show a fallback display
    if (!mapboxToken) {
      handleMapError();
      console.error('Mapbox token is not defined in environment variables');
      return;
    }

    // Set the Mapbox token
    mapboxgl.accessToken = mapboxToken;

    // Initialize map only if it doesn't exist yet
    if (!mapInstance.current && mapRef.current) {
      try {
        mapInstance.current = new mapboxgl.Map({
          container: mapRef.current,
          style: 'mapbox://styles/mapbox/satellite-streets-v12',
          center: [longitude, latitude],
          zoom: 13,
          attributionControl: false,
        });

        // Add marker at the detected location
        const markerColor = getMarkerColor();
        
        // Create a custom element for the marker
        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.style.backgroundColor = markerColor;
        el.style.width = '25px';
        el.style.height = '25px';
        el.style.borderRadius = '50%';
        el.style.border = '3px solid white';
        el.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
        
        // Add pulse effect
        const pulse = document.createElement('div');
        pulse.className = 'pulse';
        pulse.style.backgroundColor = markerColor;
        el.appendChild(pulse);

        // Add the marker to the map
        new mapboxgl.Marker(el)
          .setLngLat([longitude, latitude])
          .addTo(mapInstance.current);

        // Add navigation controls
        mapInstance.current.addControl(
          new mapboxgl.NavigationControl(),
          'top-right'
        );
      } catch (error) {
        console.error('Error initializing map:', error);
        handleMapError();
      }
    } else if (mapInstance.current) {
      // Update map center if the map already exists
      mapInstance.current.setCenter([longitude, latitude]);
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
        .pulse {
          position: absolute;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          top: 50%;
          left: 50%;
          opacity: 0;
          animation: pulse 2s infinite;
          z-index: -1;
        }
        
        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0.8;
          }
          100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }
        `}
      </style>
    </div>
  );
};

export default MapDisplay;
