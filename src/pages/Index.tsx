
import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import OceanBackground from '@/components/OceanBackground';
import PageTransition from '@/components/PageTransition';
import ImageUpload from '@/components/ImageUpload';
import { cn } from '@/lib/utils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleImageSelected = (file: File) => {
    setSelectedFile(file);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast({
        title: "No image selected",
        description: "Please upload an image first",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create form data to send to the backend
      const formData = new FormData();
      formData.append('image', selectedFile);
      
      // Call Flask backend API
      const response = await fetch(`${API_URL}/api/detect`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to process image');
      }
      
      // Store results in sessionStorage
      sessionStorage.setItem('detectionResults', JSON.stringify({
        resultImage: data.image,
        gpsCoordinates: data.gps_coordinates,
        detections: data.detections,
        count: data.count,
        averageConfidence: data.average_confidence
      }));
      
      // Navigate to results page
      navigate('/results');
      
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "There was an error processing your image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <OceanBackground />
      <PageTransition>
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10 space-y-4">
              <div className="animate-fade-down">
                <span className="text-xs uppercase tracking-wider px-3 py-1 rounded-full glass-card text-primary">
                  Underwater Plastic Detection
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold animate-fade-down animate-delay-100">
                <span className="text-gradient">Detect Plastic Waste</span>
                <br /> In Underwater Environments
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-down animate-delay-200">
                Upload your underwater images to identify plastic waste using our 
                advanced detection system powered by YOLOv8.
              </p>
            </div>

            <div className={cn(
              "rounded-3xl glass-card p-6 md:p-8",
              "mb-12 border border-border/50 shadow-lg",
              "animate-fade-up animate-delay-300"
            )}>
              <div className="space-y-8">
                <ImageUpload onImageSelected={handleImageSelected} />
                
                <div className="flex justify-center">
                  <Button 
                    onClick={handleSubmit}
                    size="lg"
                    className="glass-button text-primary font-medium px-8 py-6 h-auto"
                    disabled={!selectedFile || isSubmitting}
                  >
                    {isSubmitting ? (
                      "Processing..."
                    ) : (
                      <>
                        Detect Plastic <ArrowRight className="ml-2 w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-up animate-delay-400">
              {[
                {
                  title: "Upload",
                  description: "Upload underwater images in common formats like JPEG or PNG."
                },
                {
                  title: "Analyze",
                  description: "Our YOLOv8 model identifies plastic waste in the image with high accuracy."
                },
                {
                  title: "Locate",
                  description: "GPS coordinates are extracted from image metadata when available."
                }
              ].map((item, index) => (
                <div 
                  key={index} 
                  className="glass-card p-6 rounded-xl transition-all duration-300 hover:translate-y-[-5px]"
                  style={{ animationDelay: `${400 + (index * 100)}ms` }}
                >
                  <div className="w-10 h-10 rounded-lg glass-button flex items-center justify-center mb-4">
                    <span className="text-primary font-bold">{index + 1}</span>
                  </div>
                  <h3 className="text-xl font-medium mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageTransition>
    </>
  );
};

export default Index;
