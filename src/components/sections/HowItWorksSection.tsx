import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

const HowItWorksSection: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const sectionRect = sectionRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        // Calculate how much of the section is visible and has been scrolled through
        // Start earlier and end later to ensure we capture the entire section
        const sectionTop = sectionRect.top;
        const sectionHeight = sectionRect.height;
        
        // Adjusted calculation to make progress reach completion sooner
        const start = -viewportHeight * 0.3;  // Start even earlier
        const end = sectionHeight * 0.7;      // End earlier to reach the last card
        const current = -sectionTop;
        
        // Calculate scroll percentage
        const rawProgress = (current - start) / (end - start);
        const scrollPercentage = Math.min(1, Math.max(0, rawProgress));
        
        // Apply smooth transition with requestAnimationFrame
        setScrollProgress(prev => {
          // Faster transition with increased inertia effect
          return prev + (scrollPercentage - prev) * 0.2;
        });
      }
    };
    
    // Use requestAnimationFrame for smoother updates
    let rafId: number;
    const smoothScroll = () => {
      handleScroll();
      rafId = requestAnimationFrame(smoothScroll);
    };
    
    smoothScroll();
    
    return () => {
      cancelAnimationFrame(rafId);
    };
  }, []);

  const steps = [
    {
      id: 1,
      title: 'Register & Upload',
      description: 'Create an account and upload your documents to our secure platform. We support various file formats including PDF, DOCX, and images.',
      icon: (
        <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      )
    },
    {
      id: 2,
      title: 'Blockchain Verification',
      description: 'Our system processes your documents and creates a unique hash that is stored on the blockchain, establishing an immutable record of your document.',
      icon: (
        <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      id: 3,
      title: 'Receive Certificate',
      description: 'Get a verification certificate with a QR code and blockchain details that can be shared with third parties to prove your document\'s authenticity.',
      icon: (
        <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 4,
      title: 'Verify Anytime',
      description: 'Anyone with the certificate can verify the document\'s authenticity at any time without needing to create an account or pay fees.',
      icon: (
        <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      )
    }
  ];

  // Calculate active step based on scroll progress - evenly distribute across scroll range
  const getActiveStep = () => {
    // Modified thresholds to activate each step earlier
    const stepThresholds = [0.12, 0.3, 0.5, 0.7];
    
    if (scrollProgress < stepThresholds[0]) return -1;
    if (scrollProgress < stepThresholds[1]) return 0;
    if (scrollProgress < stepThresholds[2]) return 1;
    if (scrollProgress < stepThresholds[3]) return 2;
    return 3;
  };
  
  const activeStep = getActiveStep();
  
  // Get the progress within a specific step (0-1)
  const getStepProgress = (stepIndex: number) => {
    // Modified ranges to make each step progress faster
    const stepRanges = [
      [0.12, 0.3], // Step 1
      [0.3, 0.5],  // Step 2
      [0.5, 0.7],  // Step 3
      [0.7, 0.9]   // Step 4 - ends earlier so it completes
    ];
    
    if (stepIndex < 0 || stepIndex >= stepRanges.length) {
      return 0;
    }
    
    const [start, end] = stepRanges[stepIndex];
    const progress = (scrollProgress - start) / (end - start);
    return Math.max(0, Math.min(1, progress));
  };

  // CSS for animations and visual elements
  const styles = `
    /* Timeline styles */
    .timeline {
      position: absolute;
      left: 50%;
      top: 60px;
      bottom: 60px;
      width: 1px;
      background-color: rgba(255, 255, 255, 0.1);
      transform: translateX(-50%);
      z-index: 1;
    }
    
    .timeline-progress {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      background: linear-gradient(to bottom, #0072ff, #00c6ff);
      box-shadow: 0 0 8px rgba(0, 114, 255, 0.7);
      transition: height 0.05s ease-out;
    }
    
    /* Step marker styles - update positioning */
    .step-marker {
      position: absolute;
      left: 50%;
      width: 16px;
      height: 16px;
      background-color: #1a1a1a;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      z-index: 5;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 9px;
      transition: all 0.3s ease;
    }
    
    /* Horizontal connector styles - improved alignment */
    .horizontal-connector {
      position: absolute;
      top: 50%;
      height: 1px;
      background-color: rgba(255, 255, 255, 0.1);
      transform: translateY(-50%);
      z-index: 1;
    }
    
    .connector-left {
      right: 0;
      width: calc(50% - 175px);
    }
    
    .connector-right {
      left: 0;
      width: calc(50% - 175px);
    }
    
    .connector-progress {
      position: absolute;
      height: 100%;
      width: 0;
      background: linear-gradient(to right, #0072ff, #00c6ff);
      box-shadow: 0 0 10px rgba(0, 114, 255, 0.7);
      transition: width 0.2s ease-out;
    }
    
    .connector-left .connector-progress {
      right: 0;
    }
    
    .connector-right .connector-progress {
      left: 0;
    }
    
    /* Spark animations */
    @keyframes sparkle {
      0%, 100% { opacity: 0.8; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.3); }
    }
    
    @keyframes pulseGlow {
      0%, 100% { box-shadow: 0 0 5px rgba(0, 114, 255, 0.3); }
      50% { box-shadow: 0 0 15px rgba(0, 114, 255, 0.5); }
    }
    
    @keyframes borderFlow {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    
    .timeline-spark {
      position: absolute;
      left: 50%;
      width: 5px;
      height: 5px;
      background-color: #0072ff;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      box-shadow: 0 0 10px 2px rgba(0, 114, 255, 0.7);
      z-index: 10;
      animation: sparkle 1.5s infinite ease-in-out;
    }
    
    .connector-spark {
      position: absolute;
      top: 50%;
      width: 5px;
      height: 5px;
      background-color: #0072ff;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      box-shadow: 0 0 10px 2px rgba(0, 114, 255, 0.7);
      z-index: 10;
      animation: sparkle 1.5s infinite ease-in-out;
    }
    
    .card-spark {
      position: absolute;
      width: 4px;
      height: 4px;
      background-color: #0072ff;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      box-shadow: 0 0 8px 2px rgba(0, 114, 255, 0.7);
      z-index: 20;
      animation: sparkle 1.5s infinite ease-in-out;
    }
    
    /* Card styles */
    .card {
      width: 100%;
      position: relative;
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      border-radius: 0.75rem;
      padding: 1.5rem;
      transition: all 0.2s ease;
    }
    
    .card-wrapper {
      display: flex;
      align-items: center;
      margin: 60px 0;
      position: relative;
      min-height: 140px;
    }
    
    /* Mobile view styles - simple list of cards */
    @media (max-width: 768px) {
      .timeline, 
      .horizontal-connector,
      .card-highlight,
      .card-spark,
      .step-marker {
        display: none !important; /* Hide all animation elements and step numbers on mobile */
      }
      
      .card-wrapper {
        flex-direction: column !important;
        margin: 0;
        padding: 0;
        min-height: 0;
        width: 100%;
      }
      
      .card-wrapper .w-5\/12 {
        width: 100%;
        margin: 0 0 16px 0;
        padding: 0 !important;
      }
      
      .card {
        width: 100%;
        margin: 0 0 16px 0;
        padding: 20px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        display: block;
        aspect-ratio: auto;
        background: rgba(20, 20, 30, 0.4);
        border-radius: 8px;
      }
      
      /* Simple heading layout */
      .mobile-card-header {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
      }
      
      /* Hide step numbers on mobile */
      .mobile-step-number {
        display: none;
      }
      
      .mobile-card-content p {
        color: #aab7c4;
        font-size: 14px;
        line-height: 1.5;
      }
      
      /* Add extra padding at bottom of section for mobile */
      .mobile-bottom-padding {
        padding-bottom: 60px;
      }
      
      /* Increase spacing for "Try It Now" button and card in mobile */
      .try-it-now-section {
        margin-top: 40px;
      }
      
      .verification-certificate-card {
        margin-top: 40px !important;
      }
    }
    
    .card-highlight {
      position: absolute;
      inset: 0;
      border-radius: 0.75rem;
      border: 2px solid transparent;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
      pointer-events: none;
      z-index: 5;
    }
    
    .card-highlight.active {
      border-color: rgba(0, 114, 255, 0.5);
      box-shadow: 0 0 15px rgba(0, 114, 255, 0.2);
      animation: pulseGlow 2s infinite ease-in-out;
    }
    
    .card-highlight.active-animated {
      border: 1px solid transparent;
      background: linear-gradient(90deg, rgba(0,114,255,0) 0%, rgba(0,114,255,0.5) 50%, rgba(0,114,255,0) 100%);
      background-size: 200% 200%;
      animation: borderFlow 1.5s infinite linear;
      box-shadow: 0 0 15px rgba(0, 114, 255, 0.2);
    }
    
    .step-marker.active {
      background-color: #0072ff;
      box-shadow: 0 0 10px rgba(0, 114, 255, 0.5);
    }
  `;

  return (
    <section ref={sectionRef} id="how-it-works" className="py-20 relative overflow-hidden">
      <style>{styles}</style>
      
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-5 w-96 h-96 bg-secondary-500/5 rounded-full blur-3xl"></div>
      </div>
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It <span className="text-primary-500">Works</span></h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Our blockchain-powered verification platform is simple to use yet powerful in ensuring your documents remain secure, immutable, and easily verifiable.
          </p>
        </motion.div>

        {/* Timeline container */}
        <div className="relative max-w-6xl mx-auto md:px-4 px-0">
          {/* Main vertical timeline */}
          <div className="timeline">
            {/* Progress indicator */}
            <div 
              className="timeline-progress" 
              style={{ height: `${scrollProgress * 100}%` }}
            ></div>
            
            {/* Main spark that travels down the timeline */}
            {scrollProgress > 0 && scrollProgress < 0.95 && (
              <div 
                className="timeline-spark" 
                style={{ 
                  top: `${scrollProgress * 100}%`,
                  // Hide when a step is active and we're showing card sparks
                  display: (activeStep !== -1 && getStepProgress(activeStep) > 0.3) ? 'none' : 'block'
                }}
              ></div>
            )}
          </div>

          {/* Process Steps */}
          {steps.map((step, index) => {
            const isLeft = index % 2 === 0;
            const isActive = index <= activeStep;
            const isCurrent = index === activeStep;
            
            // Progress within this current step (0-1)
            const stepProgress = isCurrent ? getStepProgress(index) : (isActive ? 1 : 0);
            
            // Animation phases for card and connector animation
            const cardAnimationPhase = Math.min(1, Math.max(0, stepProgress * 2.5)); // Speed up animation
            const connectorPhase = Math.min(1, Math.max(0, stepProgress * 3)); // Speed up connector animation

            // Calculate border animation parameters
            const borderAnimationActive = isCurrent && cardAnimationPhase > 0;
                        
            // Calculate card sparks positions (top, right, bottom, left edges)
            const sparkPositions = [
              { top: 0, left: cardAnimationPhase * 100 }, // Top edge: left to right
              { top: cardAnimationPhase * 100, left: 100 }, // Right edge: top to bottom
              { top: 100, left: 100 - (cardAnimationPhase * 100) }, // Bottom edge: right to left
              { top: 100 - (cardAnimationPhase * 100), left: 0 } // Left edge: bottom to top
            ];
            
            // Determine which sparks to show based on animation phase
            // Only show sparks for the current active step
            let visibleSparks: Array<{top: number, left: number, progress: number}> = [];
            if (isCurrent && cardAnimationPhase > 0 && cardAnimationPhase < 1) {
              const normalizedPhase = cardAnimationPhase * 4; // 0-4 (to cover all 4 sides)
              const currentEdge = Math.min(3, Math.floor(normalizedPhase));
              const edgeProgress = normalizedPhase - currentEdge;
              
              // Add the current traveling spark
              visibleSparks.push({
                ...sparkPositions[currentEdge],
                progress: edgeProgress
              });
            }

            return (
              <div 
                key={step.id} 
                className={`card-wrapper ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}
              >
                {/* Step marker on the timeline - visible on desktop only */}
                <div 
                  className={`step-marker ${isActive ? 'active' : ''} hidden md:flex`}
                  style={{
                    top: '50%' // Center the step marker vertically with the card
                  }}
                >
                  {step.id}
                </div>
                
                {/* Card */}
                <div className={`w-full md:w-5/12 ${isLeft ? 'md:pr-12' : 'md:pl-12'} relative`}>
                  {/* Horizontal connector from card to timeline - visible on desktop */}
                  <div 
                    className={`horizontal-connector ${isLeft ? 'connector-left' : 'connector-right'} hidden md:block`}
                    style={{
                      top: '50%', // Align with the step marker
                      '--progress': connectorPhase // CSS variable for mobile progress
                    } as React.CSSProperties}
                  >
                    {isActive && (
                      <div 
                        className="connector-progress" 
                        style={{ width: isCurrent ? `${connectorPhase * 100}%` : '100%' }}
                      ></div>
                    )}
                    
                    {/* Connector spark */}
                    {isCurrent && connectorPhase > 0 && connectorPhase < 1 && (
                      <div 
                        className="connector-spark" 
                        style={{ 
                          left: isLeft 
                            ? `${100 - (connectorPhase * 100)}%` 
                            : `${connectorPhase * 100}%`
                        }}
                      ></div>
                    )}
                  </div>
                  
                  <motion.div 
                    className="card"
                    initial={{ opacity: 0.7, scale: 0.95 }}
                    animate={{ 
                      opacity: isActive ? 1 : 0.7, 
                      scale: isActive ? 1 : 0.95,
                      y: isActive ? 0 : 5
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Card highlight border - shows animated border for current card - desktop only */}
                    <div 
                      className={`card-highlight hidden md:block ${
                        borderAnimationActive ? 'active-animated' : (isActive ? 'active' : '')
                      }`}
                    ></div>
                    
                    {/* Mobile-only content - simple list layout */}
                    <div className="md:hidden">
                      <div className="mobile-card-header">
                        <h3 className="text-lg font-bold text-white">
                          {step.title}
                        </h3>
                      </div>
                      
                      <div className="mobile-card-content">
                        <p>
                          {step.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Card content - desktop version */}
                    <div className="hidden md:flex items-center mb-4">
                      <div className={`p-3 rounded-lg mr-4 ${isActive ? 'bg-primary-500/20' : 'bg-gray-800'}`}>
                        {step.icon}
                      </div>
                      <h3 className={`text-xl font-bold ${isActive ? 'text-white' : 'text-gray-400'}`}>
                        {step.title}
                      </h3>
                    </div>
                    
                    {/* Desktop-only description */}
                    <p className={`text-sm hidden md:block ${isActive ? 'text-gray-300' : 'text-gray-500'}`}>
                      {step.description}
                    </p>
                    
                    {/* Card border sparks - only on desktop */}
                    {visibleSparks.map((spark, i) => (
                      <div 
                        key={i}
                        className="card-spark hidden md:block" 
                        style={{ 
                          top: `${spark.top}%`,
                          left: `${spark.left}%`
                        }}
                      ></div>
                    ))}
                  </motion.div>
                </div>
              </div>
            );
          })}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-16 text-center try-it-now-section"
        >
          <a 
            href="#" 
            className="btn btn-primary inline-flex items-center group"
          >
            Try It Now
            <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
          
          <div className="mt-20 md:mt-16 max-w-3xl mx-auto p-4 md:p-6 card rounded-xl border border-white/5 verification-certificate-card">
            <div className="flex flex-col md:flex-row items-center text-left">
              <div className="hidden md:block p-4">
                <div className="w-16 h-16 rounded-full bg-primary-500/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-2 text-primary-400">Already have a verification certificate?</h4>
                <p className="text-gray-400 text-sm">You can verify any document's authenticity without creating an account. Just enter the document hash or scan the QR code from the certificate.</p>
                <div className="mt-4">
                  <a href="#" className="text-primary-500 hover:text-primary-400 font-medium text-sm flex items-center">
                    Verify a document
                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Extra padding div for mobile */}
          <div className="mobile-bottom-padding md:hidden"></div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection; 