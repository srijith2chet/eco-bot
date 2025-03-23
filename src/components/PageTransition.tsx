
import React from 'react';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={cn(
      "min-h-screen pt-32 pb-20 animate-fade-in",
      className
    )}>
      {children}
    </div>
  );
};

export default PageTransition;
