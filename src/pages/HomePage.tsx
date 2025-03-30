import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import HeroSection from '../components/sections/HeroSection';
import FeaturesSection from '../components/sections/FeaturesSection';
import HowItWorksSection from '../components/sections/HowItWorksSection';
import TestimonialsSection from '../components/sections/TestimonialsSection';
import FaqSection from '../components/sections/FaqSection';
import Footer from '../components/layout/Footer';
import LoadingScreen from '../components/ui/LoadingScreen';

const HomePage: React.FC = () => {
  const location = useLocation();
  const [showNavbar, setShowNavbar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Scroll to top on direct page load, unless there's a hash for section navigation
  useEffect(() => {
    if (!location.hash) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  // Skip loading screen only if coming from another page via a hash link
  useEffect(() => {
    // Check if we have a hash and it's from a navigation (not initial load)
    const fromNavigation = sessionStorage.getItem('fromNavigation') === 'true';
    
    if (location.hash && fromNavigation) {
      // Skip loading screen if coming from navigation with hash
      setIsLoading(false);
      setShowNavbar(true);
      
      // Scroll to the section after a brief delay
      setTimeout(() => {
        const element = document.getElementById(location.hash.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
    
    // Clear the navigation flag
    sessionStorage.removeItem('fromNavigation');
    
    // Set up listener for beforeunload to differentiate between
    // page refreshes and internal navigation
    const handleBeforeUnload = () => {
      sessionStorage.removeItem('fromNavigation');
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [location.hash]);

  // Callback when loading animation completes
  const handleLoadingComplete = (isComplete: boolean) => {
    setShowNavbar(isComplete);
    setIsLoading(false);
  };

  return (
    <>
      {isLoading && (
        <LoadingScreen 
          minLoadingTime={2500} 
          onLoadingComplete={handleLoadingComplete}
        />
      )}
      
      <div className="min-h-screen bg-dark-800 text-white">
        {showNavbar && <Navbar />}
        
        <main>
          <HeroSection />
          <FeaturesSection />
          <HowItWorksSection />
          <TestimonialsSection />
          <FaqSection />
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default HomePage; 