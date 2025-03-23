import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';
import OceanBackground from '@/components/OceanBackground';
import PageTransition from '@/components/PageTransition';
import ResultsDisplay from '@/components/ResultsDisplay';
import MapDisplay from '@/components/MapDisplay';
import { useToast } from '@/components/ui/use-toast';

const Results = () => {
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [gpsCoordinates, setGpsCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const MODEL_NAME = "ecobot.pt"; // Your pretrained YOLOv8 model

  useEffect(() => {
    const storedImage = sessionStorage.getItem('uploadedImage');
    
    if (!storedImage) {
      navigate('/');
      return;
    }
    
    const timer = setTimeout(() => {
      setResultImage(storedImage);
      
      const hasGps = Math.random() > 0.3;
      
      if (hasGps) {
        setGpsCoordinates({
          latitude: 25.0 + (Math.random() * 10),
          longitude: -80.0 + (Math.random() * 10),
        });
      } else {
        setGpsCoordinates(null);
      }
      
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  const handleDownload = () => {
    if (!resultImage) return;
    
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = 'detected-plastic.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Image downloaded",
      description: "The processed image has been downloaded to your device.",
    });
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <>
      <OceanBackground />
      <PageTransition>
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold animate-fade-down">Detection Results</h1>
                <p className="text-muted-foreground mt-1 animate-fade-down animate-delay-100">
                  Analysis of underwater plastic waste
                </p>
              </div>
              
              <div className="flex items-center space-x-3 animate-fade-left">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBackToHome}
                  className="glass-button"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" /> Back
                </Button>
                
                <Button
                  size="sm"
                  onClick={handleDownload}
                  disabled={!resultImage || isLoading}
                  className="glass-button text-primary"
                >
                  <Download className="mr-1 h-4 w-4" /> Download
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-10">
              <div className="lg:col-span-3 animate-fade-up">
                <ResultsDisplay
                  resultImage={resultImage}
                  gpsCoordinates={gpsCoordinates}
                  isLoading={isLoading}
                />
              </div>
              
              <div className="lg:col-span-2 space-y-6">
                <div className="glass-card rounded-xl p-6 animate-fade-up animate-delay-200">
                  <h2 className="text-lg font-medium mb-4">Detection Summary</h2>
                  
                  {isLoading ? (
                    <div className="space-y-3">
                      <div className="h-4 bg-white/5 rounded-md w-3/4 animate-pulse"></div>
                      <div className="h-4 bg-white/5 rounded-md w-1/2 animate-pulse"></div>
                      <div className="h-4 bg-white/5 rounded-md w-5/6 animate-pulse"></div>
                    </div>
                  ) : (
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <span className="font-medium text-primary">Completed</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Detection Model</span>
                        <span>{MODEL_NAME}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Confidence</span>
                        <span>78%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Items Detected</span>
                        <span>3</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {!isLoading && gpsCoordinates && (
                  <MapDisplay 
                    latitude={gpsCoordinates.latitude} 
                    longitude={gpsCoordinates.longitude}
                  />
                )}
                
                <div className="glass-card rounded-xl p-6 animate-fade-up animate-delay-500">
                  <h3 className="text-lg font-medium mb-3">What's Next?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    You can download the processed image, or upload another image for detection.
                  </p>
                  <Button
                    onClick={handleBackToHome}
                    className="w-full glass-button text-primary"
                  >
                    Analyze Another Image
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    </>
  );
};

export default Results;
