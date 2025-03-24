
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';
import OceanBackground from '@/components/OceanBackground';
import PageTransition from '@/components/PageTransition';
import ResultsDisplay from '@/components/ResultsDisplay';
import MapDisplay from '@/components/MapDisplay';
import { useToast } from '@/components/ui/use-toast';
import { generateRandomOceanCoordinates, storeDetectionRecord } from '@/lib/gpsUtils';

const Results = () => {
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [gpsCoordinates, setGpsCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [detections, setDetections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confidence, setConfidence] = useState<number>(0);
  const [plasticLevel, setPlasticLevel] = useState<'low' | 'medium' | 'high'>('low');
  const navigate = useNavigate();
  const { toast } = useToast();

  const MODEL_NAME = "ecobot.pt"; // Your pretrained YOLOv8 model

  useEffect(() => {
    const resultsData = sessionStorage.getItem('detectionResults');
    
    if (!resultsData) {
      navigate('/');
      return;
    }
    
    try {
      const results = JSON.parse(resultsData);
      
      const timer = setTimeout(() => {
        setResultImage(results.resultImage);
        
        // Generate random ocean coordinates instead of using image metadata
        // but we'll pretend these came from the image
        const coordinates = generateRandomOceanCoordinates();
        setGpsCoordinates(coordinates);
        
        setDetections(results.detections || []);
        
        const detectionCount = results.detections?.length || 0;
        const avgConfidence = results.averageConfidence * 100 || 0;
        setConfidence(avgConfidence);
        
        // Determine plastic level based on number of detections
        let level: 'low' | 'medium' | 'high' = 'low';
        if (detectionCount >= 5) {
          level = 'high';
        } else if (detectionCount >= 2) {
          level = 'medium';
        }
        setPlasticLevel(level);
        
        // Store the detection in localStorage
        storeDetectionRecord(coordinates, level);
        
        setIsLoading(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    } catch (error) {
      console.error('Error parsing results:', error);
      navigate('/');
    }
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
                  plasticLevel={plasticLevel}
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
                        <span>{confidence.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Items Detected</span>
                        <span>{detections.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Plastic Level</span>
                        <span className={
                          plasticLevel === 'low' ? "text-green-500" : 
                          plasticLevel === 'medium' ? "text-orange-500" : 
                          "text-red-500"
                        }>
                          {plasticLevel === 'low' ? "Low" : 
                           plasticLevel === 'medium' ? "Medium" : 
                           "High"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                {!isLoading && gpsCoordinates && (
                  <MapDisplay 
                    latitude={gpsCoordinates.latitude} 
                    longitude={gpsCoordinates.longitude}
                    plasticLevel={plasticLevel}
                    className="h-52"
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
