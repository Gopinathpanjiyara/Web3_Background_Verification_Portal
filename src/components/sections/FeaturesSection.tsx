import React from 'react';
import { motion } from 'framer-motion';

// Feature card component
const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
  index: number;
}> = ({ icon, title, description, delay, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true, margin: "-100px" }}
      className="relative group"
    >
      <div className="glass-card p-8 h-full z-10 relative overflow-hidden group-hover:border-primary-400/30 transition-all duration-500">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-500/10 to-primary-500/0 rounded-bl-3xl"></div>
        
        <div className="mb-6 text-primary-400 bg-primary-500/10 h-16 w-16 rounded-xl flex items-center justify-center group-hover:bg-primary-500/20 group-hover:scale-110 transition-all duration-500">
          {icon}
        </div>
        
        <h3 className="text-xl font-bold mb-3 text-white group-hover:text-primary-400 transition-all duration-300 flex items-center">
          {title}
          <motion.span 
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: delay + 0.3 }}
            viewport={{ once: true }}
            className="ml-2 text-primary-500 text-sm bg-primary-500/10 px-2 py-0.5 rounded-full"
          >
            {index === 0 && "Secure"}
            {index === 1 && "Unique"}
            {index === 2 && "Real-time"}
            {index === 3 && "User-friendly"}
          </motion.span>
        </h3>
        
        <p className="text-gray-400 group-hover:text-gray-300 transition-all duration-300">{description}</p>
        
        {/* Bottom decoration line that animates on hover */}
        <div className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-primary-500 to-primary-400/0 transition-all duration-700"></div>
        
        {/* Top right corner decoration with wave animation */}
        <motion.div 
          className="absolute top-0 right-0 w-16 h-16 overflow-hidden"
          initial={{ opacity: 0.4 }}
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <motion.path 
              d="M64 0C59 5 56 10 54 18C52 26 52 34 45 45C38 56 28 60 0 64"
              stroke="var(--color-primary-500)"
              strokeWidth="1.5"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0.2 }}
              animate={{ 
                pathLength: 1, 
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
            <motion.path 
              d="M64 0C57 8 54 16 50 25C46 34 40 40 32 48C24 56 16 60 0 64"
              stroke="var(--color-primary-400)"
              strokeWidth="1"
              strokeDasharray="2 3"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0.1 }}
              animate={{ 
                pathLength: 1, 
                opacity: [0.1, 0.6, 0.1],
              }}
              transition={{ 
                duration: 5, 
                delay: 0.5,
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
          </svg>
        </motion.div>
      </div>
      
      {/* Subtle glow effect that shows on hover */}
      <div className="absolute inset-0 bg-primary-500/5 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 rounded-xl"></div>
    </motion.div>
  );
};

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: 'Blockchain-Powered Security',
      description: 'Ensures tamper-proof document verification with a decentralized network. Every document is cryptographically secured.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'NFT-Based Certificates',
      description: 'Issue and verify certificates as NFTs for lifelong digital proof. Each certificate is unique, verifiable, and transferable.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Real-Time Status Tracking',
      description: 'Monitor document verification progress instantly. Get notified at every step of the verification process with detailed insights.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
        </svg>
      ),
      title: 'Seamless User Experience',
      description: 'Fast, intuitive, and mobile-friendly interface. Our platform is designed for ease of use while maintaining enterprise-level security.',
    },
  ];

  return (
    <section id="features" className="section bg-dark-800 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute bottom-0 left-0 right-0 h-80 bg-gradient-to-t from-dark-900 to-transparent"></div>
      <div className="absolute -right-32 top-64 w-96 h-96 bg-primary-500/5 rounded-full filter blur-[100px] animate-pulse-slow"></div>
      <div className="absolute -left-32 bottom-32 w-64 h-64 bg-secondary-500/5 rounded-full filter blur-[80px] animate-pulse-slow"></div>
      
      {/* Decorative elements */}
      <div className="absolute left-8 top-24 w-px h-16 bg-gradient-to-b from-primary-500/0 via-primary-500/50 to-primary-500/0"></div>
      <div className="absolute right-8 bottom-24 w-px h-32 bg-gradient-to-b from-primary-500/0 via-primary-500/30 to-primary-500/0"></div>
      
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center mb-4 px-3 py-1 bg-primary-500/10 border border-primary-500/20 rounded-full">
            <span className="h-2 w-2 rounded-full bg-primary-500 animate-pulse mr-2"></span>
            <span className="text-primary-300 text-sm font-medium">Advanced Feature Set</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features for <span className="gradient-text">Document Verification</span></h2>
          
          <p className="text-gray-400 max-w-2xl mx-auto">
            Our platform leverages the power of blockchain technology to provide secure, transparent, and efficient document verification.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index * 0.1}
              index={index}
            />
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mt-16 text-center"
        >
          <a href="#how-it-works" className="btn btn-primary inline-flex items-center group">
            <span>See How It Works</span>
            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection; 