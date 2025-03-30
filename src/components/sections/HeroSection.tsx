import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Particle type definition
type Particle = {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  life: number;
  maxLife: number;
};

const HeroSection: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, lastX: 0, lastY: 0 });
  const [isInitialized, setIsInitialized] = useState(false);

  // Canvas and animation setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize canvas dimensions
    const updateCanvasSize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = canvas.getBoundingClientRect().height;
      }
    };

    // First-time setup
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    setIsInitialized(true);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);

  // Mouse tracking
  useEffect(() => {
    if (!isInitialized) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      
      // Only track mouse within the hero section
      if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
        mouseRef.current.lastX = mouseRef.current.x;
        mouseRef.current.lastY = mouseRef.current.y;
        mouseRef.current.x = e.clientX;
        mouseRef.current.y = e.clientY;

        // Create particles based on cursor movement velocity
        const dx = Math.abs(mouseRef.current.x - mouseRef.current.lastX);
        const dy = Math.abs(mouseRef.current.y - mouseRef.current.lastY);
        const velocity = Math.sqrt(dx * dx + dy * dy);

        // Only create particles if there's significant movement and within canvas bounds
        if (velocity > 5) {
          const numParticles = Math.min(3, Math.floor(velocity / 10));
          for (let i = 0; i < numParticles; i++) {
            createParticle(mouseRef.current.x, mouseRef.current.y - rect.top);
          }
        }
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isInitialized]);

  // Animation loop
  useEffect(() => {
    if (!isInitialized) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      const particles = particlesRef.current;
      
      // First update all particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        // Update particle life
        p.life--;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        
        // Update position
        p.x += p.speedX;
        p.y += p.speedY;
        
        // Slow down
        p.speedX *= 0.98;
        p.speedY *= 0.98;
      }
      
      // Draw connecting lines between nearby particles
      const maxDistance = 80; // Maximum distance for connecting particles
      
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        
        // Calculate opacity based on life
        const opacity = p1.life / p1.maxLife;
        
        // Draw the particle
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.size, 0, Math.PI * 2);
        
        // Use gradient for glow effect
        const gradient = ctx.createRadialGradient(
          p1.x, p1.y, 0,
          p1.x, p1.y, p1.size * 2
        );
        gradient.addColorStop(0, `rgba(92, 225, 230, ${opacity})`);
        gradient.addColorStop(0.6, `rgba(92, 225, 230, ${opacity * 0.6})`);
        gradient.addColorStop(1, `rgba(92, 225, 230, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Check for nearby particles to draw connecting lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < maxDistance) {
            // Line opacity based on distance and particles opacity
            const lineOpacity = (1 - distance / maxDistance) * 
                              Math.min(p1.life / p1.maxLife, p2.life / p2.maxLife) * 0.4;
            
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(92, 225, 230, ${lineOpacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      
      animationFrameId = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isInitialized]);

  // Function to create a new particle
  const createParticle = (x: number, y: number) => {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 2 + 0.5;
    const size = Math.random() * 3 + 1;
    
    const particle: Particle = {
      x,
      y,
      size,
      speedX: Math.cos(angle) * speed,
      speedY: Math.sin(angle) * speed,
      life: Math.random() * 30 + 20, // Random life between 20 and 50 frames
      maxLife: 50,
    };
    
    particlesRef.current.push(particle);
  };

  return (
    <section id="home" className="pt-28 pb-20 md:pt-36 md:pb-28 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-800 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        
        {/* Cursor trace effect canvas */}
        <canvas 
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ opacity: 0.6 }}
        />
        
        {/* Animated shapes */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary-500 rounded-full filter blur-[128px] opacity-20 animate-pulse-slow"></div>
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-secondary-500 rounded-full filter blur-[128px] opacity-10 animate-pulse-slow"></div>
        
        {/* Floating dots */}
        <motion.div 
          className="highlight-dot top-[15%] left-[12%]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        />
        <motion.div 
          className="highlight-dot top-[65%] left-[8%]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
        />
        <motion.div 
          className="highlight-dot top-[25%] right-[18%]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.5 }}
        />
        <motion.div 
          className="highlight-dot top-[80%] right-[15%]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut", delay: 1.5 }}
        />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-12">
          <motion.div 
            className="w-full md:w-1/2 text-center md:text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="mb-4 inline-flex items-center py-1 px-3 bg-primary-500/10 border border-primary-500/20 rounded-full text-sm text-primary-300">
              <span className="h-2 w-2 rounded-full bg-primary-500 animate-pulse mr-2"></span>
              Blockchain-Powered Security
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="text-white">Secure, Fast, and</span><br />
              <span className="gradient-text">Transparent Document</span><br />
              <span className="text-white">Verification with <span className="relative inline-block">
                Blockchain
                <motion.span 
                  className="absolute -bottom-1 left-0 w-full h-1 bg-primary-500"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1, delay: 0.8, ease: "easeInOut" }}
                />
              </span></span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto md:mx-0 leading-relaxed">
              Upload your documents, verify authenticity, and track status seamlessly with our secure blockchain-based verification system.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start mb-6">
              <Link to="/login" className="btn btn-primary text-center flex items-center justify-center gap-2 group">
                Get Started
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <a href="#how-it-works" className="btn btn-outline text-center">
                Learn How It Works
              </a>
            </div>
          </motion.div>
          
          <motion.div 
            className="w-full md:w-1/2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          >
            {/* Animated Blockchain Illustration - hidden on mobile */}
            <div className="relative hidden md:block">
              <div className="glass-card w-full h-80 md:h-96 rounded-2xl overflow-hidden shadow-2xl relative flex items-center justify-center p-6 border border-primary-500/20">
                {/* Central hexagon with animated elements */}
                <div className="relative w-full h-full flex items-center justify-center">
                  <motion.div 
                    className="absolute w-48 h-48 border-2 border-primary-500/50 rounded-xl"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  />
                  
                  <motion.div 
                    className="absolute w-36 h-36 bg-dark-800/50 backdrop-blur-sm border border-primary-500/30 rounded-lg flex items-center justify-center"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <svg className="w-16 h-16 text-primary-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </motion.div>
                  
                  {/* Connecting lines and nodes */}
                  <div className="absolute inset-0">
                    {[...Array(6)].map((_, i) => (
                      <motion.div 
                        key={i}
                        className="absolute h-2 w-2 bg-primary-400 rounded-full"
                        style={{ 
                          left: `${15 + Math.random() * 70}%`, 
                          top: `${15 + Math.random() * 70}%` 
                        }}
                        animate={{ 
                          scale: [1, 1.5, 1],
                          opacity: [0.4, 1, 0.4]
                        }}
                        transition={{ 
                          duration: 2 + Math.random() * 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: Math.random() * 2
                        }}
                      />
                    ))}
                    
                    {/* Animated paths between nodes */}
                    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                      <motion.path 
                        d="M80,60 L160,100 L240,80" 
                        stroke="url(#blue-line-gradient)" 
                        strokeWidth="1.5"
                        strokeDasharray="5,5"
                        strokeLinecap="round"
                        fill="none"
                        animate={{ strokeDashoffset: [0, -20] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      />
                      <motion.path 
                        d="M60,120 L120,180 L220,160" 
                        stroke="url(#blue-line-gradient)" 
                        strokeWidth="1.5"
                        strokeDasharray="5,5"
                        strokeLinecap="round"
                        fill="none"
                        animate={{ strokeDashoffset: [0, -20] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      />
                      <defs>
                        <linearGradient id="blue-line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#0072ff" stopOpacity="0.2" />
                          <stop offset="50%" stopColor="#0072ff" stopOpacity="1" />
                          <stop offset="100%" stopColor="#0072ff" stopOpacity="0.2" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  
                  {/* Document with checkmark */}
                  <motion.div
                    className="absolute top-[15%] right-[20%] bg-white/5 backdrop-blur-sm w-16 h-20 rounded-md flex flex-col items-center justify-center border border-white/10"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <div className="w-10 h-2 bg-primary-500/30 rounded-sm mb-1"></div>
                    <div className="w-8 h-2 bg-primary-500/30 rounded-sm mb-1"></div>
                    <div className="w-6 h-2 bg-primary-500/30 rounded-sm mb-1"></div>
                    <motion.div 
                      className="mt-2 text-primary-500"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                  </motion.div>
                  
                  {/* Lock icon */}
                  <motion.div
                    className="absolute bottom-[15%] left-[20%] bg-dark-700/50 backdrop-blur-sm w-12 h-12 rounded-lg flex items-center justify-center border border-primary-500/20"
                    animate={{ y: [0, 5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  >
                    <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </motion.div>
                </div>
              </div>
              
              {/* Glow effect under the card */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
            </div>
            
            {/* Mobile-only simplified graphic */}
            <div className="relative block md:hidden text-center py-6">
              <div className="inline-block p-4 bg-primary-500/10 rounded-full mb-4">
                <svg className="w-16 h-16 text-primary-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Trusted by companies */}
        <motion.div 
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
        >
          {/* 
          <p className="text-gray-400 mb-6 text-sm uppercase tracking-wider font-medium">Trusted by innovative organizations</p>
          <div className="flex flex-wrap justify-center gap-8 items-center">
            <div className="h-12 w-32 rounded-md flex items-center justify-center bg-dark-700/40 backdrop-blur-sm border border-dark-600/50 p-2 hover:bg-dark-700/60 transition-all">
              <span className="text-white/70 font-bold text-xl">TechCorp</span>
            </div>
            <div className="h-12 w-32 rounded-md flex items-center justify-center bg-dark-700/40 backdrop-blur-sm border border-dark-600/50 p-2 hover:bg-dark-700/60 transition-all">
              <span className="text-white/70 font-bold text-xl">Innovex</span>
            </div>
            <div className="h-12 w-32 rounded-md flex items-center justify-center bg-dark-700/40 backdrop-blur-sm border border-dark-600/50 p-2 hover:bg-dark-700/60 transition-all">
              <span className="text-white/70 font-bold text-xl">DataSec</span>
            </div>
            <div className="h-12 w-32 rounded-md flex items-center justify-center bg-dark-700/40 backdrop-blur-sm border border-dark-600/50 p-2 hover:bg-dark-700/60 transition-all">
              <span className="text-white/70 font-bold text-xl">BlockNet</span>
            </div>
          </div>
          */}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection; 