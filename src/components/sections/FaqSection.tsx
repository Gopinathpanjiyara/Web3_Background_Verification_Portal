import React, { useState } from 'react';
import { motion } from 'framer-motion';

// FAQ item component
const FaqItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-4 border border-dark-600 rounded-lg overflow-hidden">
      <button
        className="w-full px-6 py-4 flex justify-between items-center bg-dark-700 hover:bg-dark-600 transition-colors duration-300 cursor-pointer text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-medium text-white">{question}</h3>
        <svg
          className={`w-5 h-5 text-primary-400 transform transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="px-6 py-4 bg-dark-800"
        >
          <p className="text-gray-300">{answer}</p>
        </motion.div>
      )}
    </div>
  );
};

const FaqSection: React.FC = () => {
  // FAQ data
  const faqs = [
    {
      question: 'How does blockchain verification work?',
      answer:
        'Our blockchain verification works by creating a unique cryptographic hash of your document. This hash is stored on a blockchain network, creating a tamper-proof record. When someone needs to verify your document, they can simply upload it to our system, which will generate the same hash and check it against the blockchain record. If they match, the document is verified as authentic and unaltered.'
    },
    {
      question: 'Is my data secure?',
      answer:
        'Absolutely. We never store your actual documents on the blockchain, only a secure cryptographic hash. Your documents are encrypted end-to-end during the verification process. Our system adheres to the highest security standards, including GDPR compliance and advanced encryption protocols to ensure your data remains protected at all times.'
    },
    {
      question: 'How long does verification take?',
      answer:
        'The blockchain verification process is nearly instantaneous. Once a document is uploaded, it typically takes less than 30 seconds to be verified. For initial document submissions that require validation from the issuing authority, the process may take 1-3 business days, after which any subsequent verifications are instant.'
    },
    {
      question: 'What types of documents are supported?',
      answer:
        'Our platform supports a wide range of documents including academic credentials (diplomas, transcripts, certificates), professional certifications, employment references, legal documents, and identity documents. Most common file formats are supported, including PDF, JPG, PNG, and DOCX. If you have specific document needs, please contact our support team.'
    },
    {
      question: 'Can I revoke access to my verified documents?',
      answer:
        'Yes, you have complete control over your documents. You can revoke access to any shared document at any time through your user dashboard. When access is revoked, the verification link will no longer work, though the blockchain record itself remains as a permanent timestamp of the document\'s existence and authenticity.'
    }
  ];

  return (
    <section id="faq" className="section bg-dark-900 relative">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked <span className="text-primary-400">Questions</span></h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Find answers to common questions about our blockchain document verification platform.
          </p>
        </motion.div>
        
        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <FaqItem question={faq.question} answer={faq.answer} />
            </motion.div>
          ))}
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mt-12 text-center"
          >
            <p className="text-gray-300 mb-4">Couldn't find what you're looking for?</p>
            <a href="#" className="btn btn-outline inline-flex items-center">
              Contact Support
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FaqSection; 