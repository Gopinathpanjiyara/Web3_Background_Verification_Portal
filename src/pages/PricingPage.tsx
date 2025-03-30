import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const PricingPage: React.FC = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  
  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Features with their own CTAs
  const featureHighlights = [
    {
      title: "Document Verification",
      icon: (
        <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      ),
      description: "Securely verify documents with blockchain technology",
      tiers: [
        { 
          name: "Basic", 
          price: "Free", 
          features: ["10 verifications/month", "Basic security checks"],
          cta: "Start Free",
          ctaLink: "/signup"
        },
        { 
          name: "Standard", 
          price: billingPeriod === 'monthly' ? "$29" : "$290",
          features: ["100 verifications/month", "Advanced security", "Email support"],
          cta: "Start 7-Day Trial",
          ctaLink: "/signup?plan=standard"
        },
        { 
          name: "Enterprise", 
          price: "Custom",
          features: ["Unlimited verifications", "Custom security", "Dedicated support"],
          cta: "Contact Sales",
          ctaLink: "/contact"
        }
      ]
    },
    {
      title: "API Access",
      icon: (
        <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
        </svg>
      ),
      description: "Integrate verification directly into your applications",
      tiers: [
        { 
          name: "Basic", 
          price: billingPeriod === 'monthly' ? "$49" : "$490",
          features: ["100 API calls/day", "Standard rate limits", "Basic documentation"],
          cta: "Get API Access",
          ctaLink: "/signup?plan=api-basic"
        },
        { 
          name: "Professional", 
          price: billingPeriod === 'monthly' ? "$99" : "$990",
          features: ["1,000 API calls/day", "Higher rate limits", "Technical support"],
          cta: "Start Free Trial",
          ctaLink: "/signup?plan=api-pro"
        },
        { 
          name: "Enterprise", 
          price: "Custom",
          features: ["Unlimited API calls", "Custom rate limits", "Dedicated support"],
          cta: "Contact Sales",
          ctaLink: "/contact"
        }
      ]
    },
    {
      title: "Bulk Verification",
      icon: (
        <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
        </svg>
      ),
      description: "Process multiple documents simultaneously",
      tiers: [
        { 
          name: "Starter", 
          price: billingPeriod === 'monthly' ? "$79" : "$790",
          features: ["Up to 100 docs/batch", "Basic validation", "Email notifications"],
          cta: "Start Today",
          ctaLink: "/signup?plan=bulk-starter"
        },
        { 
          name: "Business", 
          price: billingPeriod === 'monthly' ? "$149" : "$1,490",
          features: ["Up to 1,000 docs/batch", "Advanced validation", "Priority processing"],
          cta: "Upgrade to Business",
          ctaLink: "/signup?plan=bulk-business"
        },
        { 
          name: "Enterprise", 
          price: "Custom",
          features: ["Unlimited batch size", "Custom validation rules", "Dedicated account manager"],
          cta: "Contact Sales",
          ctaLink: "/contact"
        }
      ]
    },
    {
      title: "Certificate Issuance",
      icon: (
        <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
      ),
      description: "Generate blockchain-verified certificates for your documents",
      tiers: [
        { 
          name: "Basic", 
          price: billingPeriod === 'monthly' ? "$39" : "$390",
          features: ["Standard certificates", "Basic customization", "Public verification"],
          cta: "Get Started",
          ctaLink: "/signup?plan=cert-basic"
        },
        { 
          name: "Advanced", 
          price: billingPeriod === 'monthly' ? "$89" : "$890",
          features: ["Premium certificates", "Full customization", "Private verification options"],
          cta: "Upgrade Now",
          ctaLink: "/signup?plan=cert-advanced"
        },
        { 
          name: "Enterprise", 
          price: "Custom",
          features: ["White-labeled certificates", "Custom design", "Advanced verification features"],
          cta: "Contact Sales",
          ctaLink: "/contact"
        }
      ]
    }
  ];

  // Enterprise features
  const enterpriseFeatures = [
    {
      icon: (
        <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
      ),
      title: "Dedicated Account Management",
      description: "Get a dedicated account manager to support your organization's needs"
    },
    {
      icon: (
        <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
        </svg>
      ),
      title: "Custom Security Protocols",
      description: "Implement organization-specific security requirements and compliance standards"
    },
    {
      icon: (
        <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"></path>
        </svg>
      ),
      title: "Custom Integration",
      description: "Tailor our solutions to integrate seamlessly with your existing systems"
    },
    {
      icon: (
        <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
      ),
      title: "Advanced Analytics",
      description: "Gain insights with detailed analytics and customized reporting"
    },
    {
      icon: (
        <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      ),
      title: "24/7 Priority Support",
      description: "Get round-the-clock support with guaranteed response times"
    },
    {
      icon: (
        <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
        </svg>
      ),
      title: "Volume Discounts",
      description: "Special pricing for high-volume usage across all our services"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-dark-800 text-white font-sans">
      <Navbar />
      <main className="flex-grow pt-20">
        {/* Pricing Hero Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-12">
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl md:text-5xl font-bold mb-4"
              >
                Transparent Pricing for Every Need
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xl text-gray-300 max-w-3xl mx-auto"
              >
                Choose the right plan for your verification and security requirements
              </motion.p>
              
              {/* Billing Toggle */}
              <div className="mt-8 inline-flex items-center p-1 bg-dark-700 rounded-lg">
                <button 
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    billingPeriod === 'monthly' 
                      ? 'bg-primary-500 text-white' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                  onClick={() => setBillingPeriod('monthly')}
                >
                  Monthly
                </button>
                <button 
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    billingPeriod === 'annual' 
                      ? 'bg-primary-500 text-white' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                  onClick={() => setBillingPeriod('annual')}
                >
                  Annual <span className="text-xs opacity-75">(Save 15%)</span>
                </button>
              </div>
            </div>
            
            {/* Feature-specific pricing */}
            <div className="space-y-20">
              {featureHighlights.map((feature, index) => (
                <div key={index} className="bg-dark-800">
                  <div className="text-center mb-12">
                    <div className="inline-flex justify-center items-center mb-4">
                      <div className="p-3 rounded-full bg-primary-500/10">
                        {feature.icon}
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold mb-3">{feature.title}</h2>
                    <p className="text-gray-300 max-w-2xl mx-auto">{feature.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {feature.tiers.map((tier, tierIndex) => (
                      <motion.div 
                        key={tierIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: tierIndex * 0.1 }}
                        className="bg-dark-700 rounded-xl overflow-hidden border border-dark-600 hover:border-primary-500/30 transition-all hover:shadow-lg hover:shadow-primary-500/10"
                      >
                        <div className="p-6 border-b border-dark-600">
                          <h3 className="text-2xl font-bold mb-1">{tier.name}</h3>
                          <div className="mb-4">
                            <span className="text-4xl font-bold">{tier.price}</span>
                            {tier.price !== "Free" && tier.price !== "Custom" && (
                              <span className="text-gray-400 ml-2">{billingPeriod === 'monthly' ? '/month' : '/year'}</span>
                            )}
                          </div>
                          <Link 
                            to={tier.ctaLink} 
                            className="block w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 rounded-md font-medium text-center transition-colors"
                          >
                            {tier.cta}
                          </Link>
                        </div>
                        <div className="p-6">
                          <ul className="space-y-3">
                            {tier.features.map((feature, i) => (
                              <li key={i} className="flex items-start">
                                <svg className="w-5 h-5 text-primary-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Enterprise Section */}
        <section className="py-16 bg-dark-900">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-16">
              <motion.h2 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-3xl md:text-4xl font-bold mb-4"
              >
                Enterprise Solutions
              </motion.h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Tailored verification and security solutions for organizations of any size
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {enterpriseFeatures.map((feature, index) => (
                <div key={index} className="bg-dark-800 p-6 rounded-xl border border-dark-600">
                  <div className="p-3 bg-primary-500/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <Link to="/contact" className="btn btn-primary px-8 py-4 text-lg inline-flex items-center">
                Schedule a Consultation
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </Link>
            </div>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-gray-300">Find answers to common questions about our pricing and services</p>
            </div>
            
            {/* FAQ items would be rendered here */}
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-primary-900/30 to-secondary-900/30">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
              <p className="text-xl text-gray-300 mb-8">
                Choose the plan that fits your needs or contact us for a custom solution
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signup" className="btn btn-primary px-8 text-lg">
                  Start Free Trial
                </Link>
                <Link to="/contact" className="btn btn-outline px-8 text-lg">
                  Contact Sales
                </Link>
              </div>
              <p className="mt-6 text-gray-400">
                Have questions? <Link to="/contact" className="text-primary-400 hover:text-primary-300">Talk to our team</Link>
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PricingPage; 