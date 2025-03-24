
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import OceanBackground from '@/components/OceanBackground';
import PageTransition from '@/components/PageTransition';
import { getAllDetectionRecords } from '@/lib/gpsUtils';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const GlobalMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [recordsCount, setRecordsCount] = useState(0);
  
  useEffect(() => {
    const records = getAllDetectionRecords();
    setRecordsCount(records.length);
    
    if (!mapRef.current) return;
    
    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
    
    if (!mapboxToken) {
      if (mapRef.current) {
        mapRef.current.innerHTML = `
          <div class="flex items-center justify-center h-full flex-col">
            <p class="text-muted-foreground">Please add a Mapbox token to your .env file</p>
            <code class="mt-2 p-2 bg-muted rounded text-sm">VITE_MAPBOX_TOKEN=your_token_here</code>
          </div>
        `;
      }
      return;
    }
    
    // Set Mapbox token
    mapboxgl.accessToken = mapboxToken;
    
    // Initialize map
    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [0, 20],
      zoom: 1.5,
      projection: 'globe',
    });
    
    // Add navigation controls
    map.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );
    
    // Set fog and other globe settings
    map.on('style.load', () => {
      map.setFog({
        color: 'rgb(23, 25, 30)',
        'high-color': 'rgb(36, 92, 223)',
        'horizon-blend': 0.4,
        'space-color': 'rgb(11, 11, 25)',
        'star-intensity': 0.6
      });
      
      // Add points from localStorage
      const records = getAllDetectionRecords();
      
      if (records.length > 0) {
        // Prepare GeoJSON data
        const geojsonData = {
          type: 'FeatureCollection',
          features: records.map(record => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [record.coordinates.longitude, record.coordinates.latitude]
            },
            properties: {
              plasticLevel: record.plasticLevel,
              timestamp: record.timestamp
            }
          }))
        };
        
        // Add the GeoJSON source
        map.addSource('plastic-detections', {
          type: 'geojson',
          data: geojsonData
        });
        
        // Add heatmap layer
        map.addLayer({
          id: 'plastic-heat',
          type: 'heatmap',
          source: 'plastic-detections',
          paint: {
            // Increase weight based on plastic level
            'heatmap-weight': [
              'match',
              ['get', 'plasticLevel'],
              'high', 1,
              'medium', 0.6,
              'low', 0.3,
              0.3
            ],
            'heatmap-intensity': 1.5,
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, 'rgba(0, 0, 255, 0)',
              0.1, 'rgba(65, 219, 167, 0.5)',
              0.3, 'rgba(247, 214, 99, 0.7)',
              0.6, 'rgba(241, 122, 49, 0.8)',
              1, 'rgba(235, 56, 53, 0.9)'
            ],
            'heatmap-radius': 40,
            'heatmap-opacity': 0.9
          }
        });
        
        // Add circle layer
        map.addLayer({
          id: 'plastic-points',
          type: 'circle',
          source: 'plastic-detections',
          paint: {
            'circle-color': [
              'match',
              ['get', 'plasticLevel'],
              'high', '#ea384c',
              'medium', '#F97316',
              'low', '#4ade80',
              '#4ade80'
            ],
            'circle-radius': 6,
            'circle-stroke-width': 2,
            'circle-stroke-color': 'white',
            'circle-opacity': 0.7
          }
        });
      }
      
      setMapLoaded(true);
    });
    
    // Add rotation animation
    const secondsPerRevolution = 180;
    let userInteracting = false;
    let spinEnabled = true;
    
    function spinGlobe() {
      if (!map) return;
      
      const zoom = map.getZoom();
      if (spinEnabled && !userInteracting && zoom < 4) {
        const center = map.getCenter();
        center.lng -= 0.25;
        map.easeTo({
          center,
          duration: 100,
          easing: (n) => n
        });
        requestAnimationFrame(spinGlobe);
      } else {
        requestAnimationFrame(spinGlobe);
      }
    }
    
    // Handle user interaction
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
    
    // Start spinning the globe
    spinGlobe();
    
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
    </>
  );
};

export default GlobalMap;
