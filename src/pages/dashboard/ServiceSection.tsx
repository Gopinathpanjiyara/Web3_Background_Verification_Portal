import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

// API URL
const API_URL = 'http://localhost:5001/api';

// Services interface
interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  active: boolean;
}

const ServiceSection: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Try to get services data from API
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await axios.get<Service[]>(`${API_URL}/dashboard/services`);
        setServices(response.data);
      } catch (error) {
        console.error('Error fetching services:', error);
        setError('Failed to load services. Please try again later.');
        
        // Fallback data for development/demo
        setServices([
          {
            id: 'service-1',
            name: 'Standard Verification',
            description: 'Basic document verification with blockchain security.',
            price: 0,
            active: true
          },
          {
            id: 'service-2',
            name: 'Premium Verification',
            description: 'Advanced document verification with enhanced security features.',
            price: 29.99,
            active: true
          },
          {
            id: 'service-3',
            name: 'Enterprise Solution',
            description: 'Custom verification solution for organizations with high-volume needs.',
            price: 199.99,
            active: true
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
        <svg className="w-12 h-12 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-xl font-bold mb-2">Error Loading Services</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Available Services</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(service => (
          <div 
            key={service.id}
            className="bg-dark-700/50 backdrop-blur-sm border border-dark-600 rounded-xl p-6 hover:shadow-lg hover:shadow-primary-500/10 transition-all duration-300"
          >
            <h3 className="text-xl font-bold mb-2">{service.name}</h3>
            <p className="text-gray-300 mb-4">{service.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold">
                {service.price === 0 ? 'Free' : `$${service.price.toFixed(2)}`}
              </span>
              <button
                className={`px-4 py-2 rounded-lg ${
                  service.active 
                    ? 'bg-primary-500 hover:bg-primary-600 text-white' 
                    : 'bg-gray-600 cursor-not-allowed'
                } transition-colors duration-300`}
                disabled={!service.active}
              >
                {service.active ? 'Activate' : 'Unavailable'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default ServiceSection; 