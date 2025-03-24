import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import OceanBackground from '@/components/OceanBackground';
import PageTransition from '@/components/PageTransition';
import { getAllDetectionRecords } from '@/lib/gpsUtils';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const GlobalMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [recordsCount, setRecordsCount] = useState(0);
  
  useEffect(() => {
    const allRecords = getAllDetectionRecords();
    setRecordsCount(allRecords.length);
    
    if (!mapRef.current) return;
    
    // Initialize map with Leaflet
    const map = L.map(mapRef.current, {
      center: [20, 0],
      zoom: 2,
      minZoom: 2,
      maxBounds: [
        [-90, -180],
        [90, 180]
      ],
      maxBoundsViscosity: 1.0,
      attributionControl: false,
    });
    
    // Add a tile layer (Dark theme from CartoDB)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);
    
    // Add navigation controls
    L.control.zoom({
      position: 'topright'
    }).addTo(map);
    
    // Add attribution control
    L.control.attribution({
      position: 'bottomright'
    }).addAttribution('© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors').addTo(map);
    
    // Add points from localStorage - using the already fetched records
    if (allRecords.length > 0) {
      // Create heatmap data points
      const heatData = allRecords.map(record => {
        // Set intensity based on plastic level
        const intensity = record.plasticLevel === 'high' ? 1 :
                        record.plasticLevel === 'medium' ? 0.6 : 0.3;
                        
        return [
          record.coordinates.latitude,
          record.coordinates.longitude,
          intensity
        ];
      });
      
      // Add markers for each detection point
      allRecords.forEach(record => {
        const markerColor = record.plasticLevel === 'high' ? '#ea384c' :
                          record.plasticLevel === 'medium' ? '#F97316' : '#4ade80';
        
        // Add a marker at the location
        L.circleMarker([record.coordinates.latitude, record.coordinates.longitude], {
          radius: 5,
          fillColor: markerColor,
          color: '#fff',
          weight: 1.5,
          opacity: 0.8,
          fillOpacity: 0.7
        }).addTo(map);
      });
      
      // Add clustering when we have many points
      if (allRecords.length > 5) {
        // Instead of using markerClusterGroup, we'll just use standard markers
        // as the clustering plugin is not available by default in Leaflet
        const markers = allRecords.map(record => {
          return L.marker([record.coordinates.latitude, record.coordinates.longitude], {
            opacity: 0.6
          }).addTo(map);
        });
        
        // If we need clustering in the future, we would need to add the leaflet.markercluster plugin
        // and initialize it here
      }
    }
    
    setMapLoaded(true);
    
    // Simple rotation effect (moving the center of the map slowly)
    let userInteracting = false;
    const startLongitude = 0;
    
    function rotateGlobe() {
      if (!userInteracting && map.getZoom() < 4) {
        const center = map.getCenter();
        center.lng = ((center.lng + 0.5) % 360) - 180;
        map.setView(center, map.getZoom(), { animate: false });
        setTimeout(rotateGlobe, 100);
      } else {
        setTimeout(rotateGlobe, 100);
      }
    }
    
    map.on('mousedown', () => {
      userInteracting = true;
    });
    
    map.on('mouseup', () => {
      userInteracting = false;
    });
    
    map.on('dragend', () => {
      userInteracting = false;
    });
    
    map.on('touchend', () => {
      userInteracting = false;
    });
    
    // Start the rotation
    rotateGlobe();
    
    // Cleanup
    return () => {
      map.remove();
    };
  }, []);
  
  return (
    <>
      <OceanBackground />
      <PageTransition>
        <div className="container px-4 mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold animate-fade-down">Global Plastic Map</h1>
                <p className="text-muted-foreground mt-1 animate-fade-down animate-delay-100">
                  Visualizing {recordsCount} plastic detection points across our oceans
                </p>
              </div>
              
              <div className="flex items-center space-x-3 animate-fade-left">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="glass-button"
                >
                  <Link to="/">
                    <ArrowLeft className="mr-1 h-4 w-4" /> Back to Home
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="glass-card rounded-2xl overflow-hidden h-[70vh] mb-8 animate-fade-up animate-delay-200">
              <div ref={mapRef} className="w-full h-full" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 animate-fade-up animate-delay-300">
              {[
                {
                  level: 'Low',
                  color: '#4ade80',
                  description: 'Areas with minimal plastic waste detected (1 item)'
                },
                {
                  level: 'Medium',
                  color: '#F97316',
                  description: 'Areas with moderate plastic pollution (2-4 items)'
                },
                {
                  level: 'High',
                  color: '#ea384c',
                  description: 'Areas with significant plastic contamination (5+ items)'
                }
              ].map((item, index) => (
                <div key={index} className="glass-card p-4 rounded-xl flex items-center space-x-3">
                  <div 
                    className="w-6 h-6 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <h3 className="font-medium">{item.level} Density</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="glass-card rounded-xl p-6 mb-10 text-center animate-fade-up animate-delay-400">
              <p className="text-muted-foreground">
                This map represents the global distribution of underwater plastic waste detections.
                The data is collected anonymously from user uploads and the GPS coordinates are extracted from image metadata.
              </p>
            </div>
          </div>
        </div>
      </PageTransition>
      <style>
        {`
          .cluster-marker-container {
            background-color: transparent;
          }
          
          .cluster-marker {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: rgba(65, 219, 167, 0.8);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            border: 2px solid white;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
          }
        `}
      </style>
    </>
  );
};

export default GlobalMap;
