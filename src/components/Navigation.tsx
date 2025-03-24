
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, Image, Info, Menu, X, Globe } from 'lucide-react';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);
  
  const isActive = (path: string) => location.pathname === path;
  
  const links = [
    { name: 'Home', path: '/', icon: <Home className="w-4 h-4" /> },
    { name: 'Results', path: '/results', icon: <Image className="w-4 h-4" /> },
    { name: 'Global Map', path: '/global-map', icon: <Globe className="w-4 h-4" /> },
    { name: 'About', path: '/about', icon: <Info className="w-4 h-4" /> }
  ];
  
  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full",
      scrolled ? "py-3 bg-background/70 backdrop-blur-xl" : "py-6"
    )}>
      <div className="container px-4 mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3">
          <div className="relative w-10 h-10 glass-card flex items-center justify-center rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-primary/20 animate-pulse-slow"></div>
            <span className="text-xl font-bold text-white">P</span>
          </div>
          <span className="text-xl font-medium text-gradient">EcoBot</span>
        </Link>
        
        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2",
                isActive(link.path) 
                  ? "bg-primary/20 text-primary" 
                  : "text-foreground/70 hover:text-foreground hover:bg-white/5"
              )}
            >
              {link.icon}
              <span>{link.name}</span>
            </Link>
          ))}
        </nav>
        
        {/* Mobile menu button */}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="md:hidden glass-button p-2 rounded-lg"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      
      {/* Mobile navigation */}
      <div className={cn(
        "fixed inset-0 bg-background/95 backdrop-blur-lg z-40 transition-all duration-300 flex flex-col pt-24 px-6",
        isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
      )}>
        <nav className="flex flex-col space-y-4">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "px-4 py-4 rounded-lg transition-all duration-300 flex items-center space-x-3",
                isActive(link.path) 
                  ? "bg-primary/20 text-primary" 
                  : "text-foreground/70 hover:text-foreground hover:bg-white/5"
              )}
            >
              {link.icon}
              <span className="text-lg">{link.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Navigation;
