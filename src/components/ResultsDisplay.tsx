
import React from 'react';
import { MapPin, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface ResultsDisplayProps {
  resultImage: string | null;
  gpsCoordinates: { latitude: number; longitude: number } | null;
  plasticLevel?: 'low' | 'medium' | 'high';
  isLoading?: boolean;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  resultImage,
  gpsCoordinates,
  plasticLevel = 'low',
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 p-8 glass-card rounded-2xl animate-pulse">
        <div className="w-full h-64 bg-white/5 rounded-xl"></div>
        <div className="w-3/4 h-6 bg-white/5 rounded-md"></div>
        <div className="w-1/2 h-4 bg-white/5 rounded-md"></div>
      </div>
    );
  }

  if (!resultImage) {
    return (
      <div className="flex flex-col items-center justify-center p-8 glass-card rounded-2xl h-80 text-center">
        <p className="text-muted-foreground">
          No results to display yet. Upload an image to detect plastic.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6 animate-fade-in">
      <div className="glass-card rounded-2xl overflow-hidden">
        <img
          src={resultImage}
          alt="Detected plastic"
          className="w-full h-auto max-h-[500px] object-contain"
        />
      </div>

      <div className={cn(
        "glass-card rounded-xl p-5 flex items-center space-x-4",
        "animate-fade-up animate-delay-300"
      )}>
        <div className={cn(
          "p-2.5 rounded-lg",
          plasticLevel === 'low' ? "bg-green-500/20" : 
          plasticLevel === 'medium' ? "bg-orange-500/20" : 
          "bg-red-500/20"
        )}>
          <MapPin className={cn(
            "w-5 h-5",
            plasticLevel === 'low' ? "text-green-500" : 
            plasticLevel === 'medium' ? "text-orange-500" : 
            "text-red-500"
          )} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium">GPS Location</h3>
          {gpsCoordinates ? (
            <p className="text-sm text-muted-foreground mt-1">
              {gpsCoordinates.latitude.toFixed(6)}, {gpsCoordinates.longitude.toFixed(6)}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground mt-1">
              No GPS data available in the image metadata
            </p>
          )}
        </div>
      </div>

      <div className={cn(
        "glass-card rounded-xl p-5 flex items-center space-x-4",
        "animate-fade-up animate-delay-400"
      )}>
        <div className="p-2.5 rounded-lg bg-blue-500/20">
          <Globe className="w-5 h-5 text-blue-500" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium">Global Impact</h3>
          <p className="text-sm text-muted-foreground mt-1">
            This detection has been added to our global plastic waste map
          </p>
        </div>
        <Link 
          to="/global-map" 
          className="text-sm text-primary hover:underline"
        >
          View Map
        </Link>
      </div>
    </div>
  );
};

export default ResultsDisplay;
