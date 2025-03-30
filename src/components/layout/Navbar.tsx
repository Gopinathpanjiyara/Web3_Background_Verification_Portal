import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { frLogo } from '../../assets';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  // Extract hash from location to highlight the correct section
  useEffect(() => {
    if (location.hash) {
      const sectionId = location.hash.substring(1);
      setActiveSection(sectionId);
    }
  }, [location.hash]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
      
      // Only update active section based on scroll if we're on the home page
      if (isHomePage) {
        const sections = ['home', 'features', 'how-it-works', 'faq'];
        let currentSection = 'home';
        
        sections.forEach(section => {
          const element = document.getElementById(section);
          if (element) {
            const rect = element.getBoundingClientRect();
            if (rect.top <= 100 && rect.bottom >= 100) {
              currentSection = section;
            }
          }
        });
        
        setActiveSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  const navbarClass = isScrolled
    ? 'bg-dark-800/90 backdrop-blur-md shadow-lg border-b border-white/5'
    : 'bg-transparent';

  // Get current theme-based logo color
  const logoColor = isScrolled ? 'filter-primary-glow' : 'filter-white-glow';

  // Determine the proper link based on the current page
  const getSectionLink = (section: string) => {
    if (isHomePage) {
      return `#${section}`; // On home page, use anchor link
    } else {
      return `/#${section}`; // On other pages, navigate to home page with anchor
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`${navbarClass} fixed top-0 left-0 right-0 z-50 transition-all duration-300`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo only - fr_logo.svg with enhanced animation */}
            <Link 
              to="/" 
              className="flex items-center group"
              onClick={() => sessionStorage.removeItem('fromNavigation')}
            >
              <div className="relative">
                <motion.div 
                  className={`h-10 flex items-center justify-center transition-all duration-300 ${logoColor}`}
                  // Pulse animation to match the loading screen aesthetic
                  animate={{ 
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  // Enhanced hover animation
                  whileHover={{ 
                    rotate: [0, -5, 5, 0],
                    scale: 1.1,
                    filter: 'brightness(1.2)',
                    transition: { duration: 0.5 }
                  }}
                >
                  <img 
                    src={frLogo} 
                    alt="First Reference Logo" 
                    className="h-10" 
                    style={{ 
                      filter: isScrolled 
                        ? 'drop-shadow(0 0 5px rgba(99, 102, 241, 0.7))' 
                        : 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.5))'
                    }}
                  />
                </motion.div>
                {/* Glow effect on hover - matches the primary colors */}
                <motion.div 
                  className="absolute -inset-1 rounded-lg bg-primary-500/30 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300 -z-10"
                  animate={{
                    opacity: [0.1, 0.3, 0.1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <NavLink 
                href={getSectionLink('home')} 
                label="Home" 
                isActive={isHomePage && activeSection === 'home'}
              />
              <NavLink 
                href={getSectionLink('features')} 
                label="Features" 
                isActive={isHomePage && activeSection === 'features'}
              />
              <NavLink 
                href={getSectionLink('how-it-works')} 
                label="How It Works" 
                isActive={isHomePage && activeSection === 'how-it-works'}
              />
              <NavLink 
                href={getSectionLink('faq')} 
                label="FAQs" 
                isActive={isHomePage && activeSection === 'faq'}
              />
              <Link 
                to="/pricing" 
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${location.pathname === '/pricing' ? 'text-primary-400' : 'text-white hover:text-primary-400'}`}
                // Force a fresh load of the page by removing navigation flag
                onClick={() => sessionStorage.removeItem('fromNavigation')}
              >
                Pricing
              </Link>
              <div className="ml-2">
                <Link
                  to="/login"
                  className="btn btn-primary text-sm px-5 py-2 flex items-center"
                  onClick={() => sessionStorage.removeItem('fromNavigation')}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Login / Register
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white p-1"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              <div className="w-8 h-8 flex items-center justify-center relative">
                <motion.span
                  className="w-6 h-0.5 bg-white absolute"
                  animate={{ 
                    rotate: isMobileMenuOpen ? 45 : 0,
                    y: isMobileMenuOpen ? 0 : -4
                  }}
                  transition={{ duration: 0.3 }}
                />
                <motion.span
                  className="w-6 h-0.5 bg-white absolute"
                  animate={{ 
                    opacity: isMobileMenuOpen ? 0 : 1
                  }}
                  transition={{ duration: 0.3 }}
                />
                <motion.span
                  className="w-6 h-0.5 bg-white absolute"
                  animate={{ 
                    rotate: isMobileMenuOpen ? -45 : 0,
                    y: isMobileMenuOpen ? 0 : 4
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-dark-700/90 backdrop-blur-md border-t border-white/5"
            >
              <div className="container mx-auto px-4">
                <div className="flex flex-col space-y-3 py-4">
                  <MobileNavLink
                    href={getSectionLink('home')}
                    label="Home"
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                    isActive={isHomePage && activeSection === 'home'}
                  />
                  <MobileNavLink
                    href={getSectionLink('features')}
                    label="Features"
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                      </svg>
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                    isActive={isHomePage && activeSection === 'features'}
                  />
                  <MobileNavLink
                    href={getSectionLink('how-it-works')}
                    label="How It Works"
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                    isActive={isHomePage && activeSection === 'how-it-works'}
                  />
                  <MobileNavLink
                    href={getSectionLink('faq')}
                    label="FAQs"
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                    isActive={isHomePage && activeSection === 'faq'}
                  />
                  <Link
                    to="/pricing"
                    className={`flex items-center px-4 py-3 rounded-lg hover:bg-dark-600 transition-all ${location.pathname === '/pricing' ? 'text-primary-400' : 'text-white hover:text-primary-400'}`}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      sessionStorage.removeItem('fromNavigation');
                    }}
                  >
                    <span className="mr-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                    Pricing
                  </Link>
                  <div className="pt-4">
                    <Link
                      to="/login"
                      className="btn btn-primary w-full flex items-center justify-center"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        sessionStorage.removeItem('fromNavigation');
                      }}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Login / Register
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
      
      {/* Floating action button for mobile (visible only on smaller screens) */}
      <div className="fixed bottom-6 right-6 md:hidden z-40">
        <Link
          to="/login"
          className="flex items-center justify-center h-12 w-12 rounded-full bg-primary-500 text-white shadow-lg hover:bg-primary-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
        </Link>
      </div>
    </>
  );
};

// Desktop navigation link component
const NavLink: React.FC<{ href: string; label: string; isActive: boolean }> = ({ 
  href, 
  label,
  isActive
}) => {
  const isHashLink = href.startsWith('/#') || href.startsWith('#');
  
  // Handle clicking the navigation link
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Mark that we're navigating within the app
    sessionStorage.setItem('fromNavigation', 'true');
    
    // Only handle special scrolling for hash links on the current page
    if (isHashLink && href.startsWith('#')) {
      e.preventDefault();
      
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
        // Update URL without causing page reload
        window.history.pushState(null, '', href);
      }
    }
  };
  
  return (
    <a 
      href={href}
      onClick={handleClick}
      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
        isActive 
          ? 'text-primary-400'  
          : 'text-white hover:text-primary-400'
      }`}
    >
      {label}
    </a>
  );
};

// Mobile navigation link component
const MobileNavLink: React.FC<{ 
  href: string; 
  label: string; 
  icon: React.ReactNode;
  onClick: () => void;
  isActive: boolean;
}> = ({ 
  href, 
  label, 
  icon,
  onClick, 
  isActive
}) => {
  const isHashLink = href.startsWith('/#') || href.startsWith('#');
  
  // Handle clicking the navigation link
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Mark that we're navigating within the app
    sessionStorage.setItem('fromNavigation', 'true');
    
    // Close mobile menu
    onClick();
    
    // Only handle special scrolling for hash links on the current page
    if (isHashLink && href.startsWith('#')) {
      e.preventDefault();
      
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
        // Update URL without causing page reload
        window.history.pushState(null, '', href);
      }
    }
  };
  
  return (
    <a
      href={href}
      onClick={handleClick}
      className={`flex items-center px-4 py-3 rounded-lg hover:bg-dark-600 transition-all ${
        isActive 
          ? 'text-primary-400' 
          : 'text-white hover:text-primary-400'
      }`}
    >
      <span className="mr-3">{icon}</span>
      {label}
    </a>
  );
};

export default Navbar; 