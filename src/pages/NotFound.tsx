
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import OceanBackground from '@/components/OceanBackground';
import PageTransition from '@/components/PageTransition';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <>
      <OceanBackground />
      <PageTransition className="flex items-center justify-center text-center">
        <div className="container px-4 mx-auto">
          <div className="max-w-md mx-auto glass-card rounded-2xl p-8 animate-fade-up">
            <h1 className="text-6xl font-bold text-gradient mb-6">404</h1>
            <p className="text-2xl font-medium mb-2">Page Not Found</p>
            <p className="text-muted-foreground mb-8">
              The page you are looking for doesn't exist or has been moved.
            </p>
            <Button
              onClick={() => navigate('/')}
              className="glass-button text-primary px-6"
              size="lg"
            >
              <ArrowLeft className="mr-2 w-4 h-4" /> Back to Home
            </Button>
          </div>
        </div>
      </PageTransition>
    </>
  );
};

export default NotFound;
