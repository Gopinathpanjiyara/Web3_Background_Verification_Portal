import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Sample testimonial data
const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'HR Director, TechCorp',
    image: 'https://randomuser.me/api/portraits/women/1.jpg',
    content:
      'BlockVerify has completely transformed our hiring process. The ability to verify educational credentials instantly has saved us countless hours and reduced fraud significantly.',
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'University Registrar',
    image: 'https://randomuser.me/api/portraits/men/2.jpg',
    content:
      'Our university now issues all certificates with blockchain verification. Students love the ability to share their credentials digitally with employers. The security is unmatched.',
  },
  {
    id: 3,
    name: 'Elena Rodriguez',
    role: 'Software Engineer',
    image: 'https://randomuser.me/api/portraits/women/3.jpg',
    content:
      'As someone who works internationally, having my qualifications instantly verifiable has made job applications much smoother. The blockchain verification gives employers confidence in my credentials.',
  },
  {
    id: 4,
    name: 'David Okafor',
    role: 'Recruitment Specialist',
    image: 'https://randomuser.me/api/portraits/men/4.jpg',
    content:
      'The speed of verification is impressive. What used to take weeks now takes seconds. Our recruitment process has become significantly more efficient with BlockVerify.',
  },
];

const TestimonialsSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextTestimonial = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="section bg-dark-800 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-dark-900 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-dark-900 to-transparent"></div>
      
      {/* Content */}
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our <span className="text-primary-400">Users Say</span></h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Join thousands of satisfied users who trust our blockchain verification system.
          </p>
        </motion.div>
        
        {/* Testimonials slider */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Main testimonial */}
            <motion.div
              key={testimonials[activeIndex].id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-dark-700 rounded-2xl p-8 shadow-xl border border-dark-600"
            >
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="flex-shrink-0">
                  <img
                    src={testimonials[activeIndex].image}
                    alt={testimonials[activeIndex].name}
                    className="w-20 h-20 rounded-full border-4 border-primary-500"
                  />
                </div>
                <div className="flex-1">
                  {/* Quote icon */}
                  <svg className="w-10 h-10 text-primary-500/20 mb-4" fill="currentColor" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.722 6.342c-5.528 0-10.006 4.483-10.006 10.006 0 5.527 4.483 10.006 10.006 10.006 5.527 0 10.006-4.483 10.006-10.006 0-5.527-4.483-10.006-10.006-10.006zm0 17.979c-4.346 0-7.976-3.63-7.976-7.976 0-4.346 3.63-7.976 7.976-7.976 4.346 0 7.976 3.63 7.976 7.976 0 4.346-3.63 7.976-7.976 7.976zM21.278 6.342c-1.87 0-3.63.728-4.951 2.048-1.321 1.321-2.048 3.08-2.048 4.951 0 5.527 4.483 10.006 10.006 10.006 5.527 0 10.006-4.483 10.006-10.006 0-5.527-4.483-10.006-10.006-10.006zm0 17.979c-4.346 0-7.976-3.63-7.976-7.976 0-1.321.4-2.548 1.094-3.63.694-1.094 1.639-1.946 2.733-2.548 1.094-.6 2.321-.949 3.63-.949 4.346 0 7.976 3.63 7.976 7.976 0 4.346-3.63 7.976-7.976 7.976z" />
                  </svg>
                  
                  <p className="text-lg text-gray-300 mb-6 italic">
                    {testimonials[activeIndex].content}
                  </p>
                  
                  <div>
                    <h4 className="text-xl font-bold text-white">{testimonials[activeIndex].name}</h4>
                    <p className="text-primary-400">{testimonials[activeIndex].role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Navigation buttons */}
            <div className="flex justify-between mt-8">
              <button 
                onClick={prevTestimonial}
                className="bg-dark-700 hover:bg-dark-600 text-white p-3 rounded-full shadow-lg transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="flex items-center gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      activeIndex === index ? 'bg-primary-500 w-10' : 'bg-dark-600'
                    }`}
                  />
                ))}
              </div>
              
              <button 
                onClick={nextTestimonial}
                className="bg-dark-700 hover:bg-dark-600 text-white p-3 rounded-full shadow-lg transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection; 