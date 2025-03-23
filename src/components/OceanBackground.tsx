
import React, { useEffect, useRef } from 'react';

const OceanBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const bubbleCount = 20;
    
    // Clear any existing bubbles
    const existingBubbles = container.querySelectorAll('.bubble');
    existingBubbles.forEach(bubble => bubble.remove());
    
    // Create new bubbles
    for (let i = 0; i < bubbleCount; i++) {
      const bubble = document.createElement('div');
      bubble.className = 'bubble bubble-animation';
      
      // Random size between 5px and 40px
      const size = Math.random() * 35 + 5;
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      
      // Random horizontal position
      bubble.style.left = `${Math.random() * 100}%`;
      
      // Random start time
      bubble.style.animationDelay = `${Math.random() * 15}s`;
      
      // Random animation duration between 15s and 30s
      bubble.style.animationDuration = `${Math.random() * 15 + 15}s`;
      
      // Add bubble to container
      container.appendChild(bubble);
    }
    
    // Cleanup
    return () => {
      const bubbles = container.querySelectorAll('.bubble');
      bubbles.forEach(bubble => bubble.remove());
    };
  }, []);
  
  return (
    <div className="ocean-background" ref={containerRef}>
      <div className="wave wave1"></div>
      <div className="wave wave2"></div>
      <div className="wave wave3"></div>
    </div>
  );
};

export default OceanBackground;
