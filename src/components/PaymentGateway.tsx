import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface PaymentGatewayProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

// Define payment method types
type PaymentMethod = 'card' | 'upi' | 'netbanking' | 'wallet';

const PaymentGateway: React.FC<PaymentGatewayProps> = ({ amount, onSuccess, onCancel }) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [selectedWallet, setSelectedWallet] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Available banks for netbanking
  const banks = [
    { id: 'sbi', name: 'State Bank of India' },
    { id: 'hdfc', name: 'HDFC Bank' },
    { id: 'icici', name: 'ICICI Bank' },
    { id: 'axis', name: 'Axis Bank' },
    { id: 'kotak', name: 'Kotak Mahindra Bank' },
    { id: 'pnb', name: 'Punjab National Bank' }
  ];

  // Available digital wallets
  const wallets = [
    { id: 'paytm', name: 'Paytm' },
    { id: 'phonepe', name: 'PhonePe' },
    { id: 'gpay', name: 'Google Pay' },
    { id: 'amazonpay', name: 'Amazon Pay' },
    { id: 'mobikwik', name: 'MobiKwik' }
  ];

  const formatCardNumber = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    // Format with spaces every 4 digits
    let formatted = '';
    for (let i = 0; i < digits.length; i += 4) {
      formatted += digits.slice(i, i + 4) + ' ';
    }
    return formatted.trim();
  };

  const formatExpiryDate = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    // Format as MM/YY
    if (digits.length > 2) {
      return digits.slice(0, 2) + '/' + digits.slice(2, 4);
    }
    return digits;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      setCardNumber(formatted);
    }
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    if (formatted.length <= 5) {
      setExpiryDate(formatted);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 3) {
      setCvv(value);
    }
  };

  const validateUpiId = (id: string) => {
    // Basic UPI ID validation (username@provider)
    const upiPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
    return upiPattern.test(id);
  };

  const validateForm = () => {
    // Reset error
    setError(null);

    if (paymentMethod === 'card') {
      // Validate card number (should be 16 digits)
      if (cardNumber.replace(/\s/g, '').length !== 16) {
        setError('Please enter a valid 16-digit card number');
        return false;
      }

      // Validate name
      if (!cardName.trim()) {
        setError('Please enter the name on your card');
        return false;
      }

      // Validate expiry date (should be in MM/YY format)
      const expiryPattern = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
      if (!expiryPattern.test(expiryDate)) {
        setError('Please enter a valid expiry date (MM/YY)');
        return false;
      }

      // Validate CVV (should be 3 digits)
      if (cvv.length !== 3) {
        setError('Please enter a valid 3-digit CVV code');
        return false;
      }
    } else if (paymentMethod === 'upi') {
      // Validate UPI ID
      if (!validateUpiId(upiId)) {
        setError('Please enter a valid UPI ID (e.g., username@upi)');
        return false;
      }
    } else if (paymentMethod === 'netbanking') {
      // Validate bank selection
      if (!selectedBank) {
        setError('Please select a bank');
        return false;
      }
    } else if (paymentMethod === 'wallet') {
      // Validate wallet selection
      if (!selectedWallet) {
        setError('Please select a wallet');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    // Simulate payment processing
    setTimeout(() => {
      let isSuccess = false;
      
      // Different success criteria based on payment method
      if (paymentMethod === 'card') {
        // Cards that start with 4 (like Visa) will succeed
        const successPattern = /^4[0-9]{3} [0-9]{4} [0-9]{4} [0-9]{4}$/;
        isSuccess = successPattern.test(cardNumber);
      } else if (paymentMethod === 'upi') {
        // UPI IDs ending with @okaxis, @okicici, or @oksbi will succeed
        const successPattern = /@ok(axis|icici|sbi)$/;
        isSuccess = successPattern.test(upiId);
      } else if (paymentMethod === 'netbanking' || paymentMethod === 'wallet') {
        // Netbanking and wallets always succeed in demo
        isSuccess = true;
      }

      if (isSuccess) {
        setIsProcessing(false);
        onSuccess();
      } else {
        setIsProcessing(false);
        if (paymentMethod === 'card') {
          setError('Payment failed. Please try a different card or use card number starting with 4');
        } else if (paymentMethod === 'upi') {
          setError('Payment failed. For demo, use UPI ID ending with @okaxis, @okicici, or @oksbi');
        } else {
          setError('Payment failed. Please try a different payment method');
        }
      }
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-700/50"
    >
      <h2 className="text-3xl font-bold mb-4 text-white bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">Complete Payment</h2>
      <div className="flex justify-between items-center mb-6">
        <p className="text-slate-300">Amount: <span className="text-xl font-bold text-white">₹{amount.toFixed(2)}</span></p>
        <div className="flex space-x-2">
          <img src="https://cdn.iconscout.com/icon/free/png-256/free-visa-3-226460.png" alt="Visa" className="h-6" />
          <img src="https://cdn.iconscout.com/icon/free/png-256/free-mastercard-3-226462.png" alt="MasterCard" className="h-6" />
          <img src="https://cdn.iconscout.com/icon/free/png-256/free-upi-2085056-1747946.png" alt="UPI" className="h-6" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Side - Payment Methods */}
        <div className="md:col-span-1 bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-300 mb-4 pb-2 border-b border-slate-700">Payment Options</h3>
          
          <div className="flex flex-col space-y-2">
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`flex items-center justify-start p-3 rounded-lg transition-all ${
                paymentMethod === 'card'
                  ? 'bg-indigo-500/20 text-indigo-300 border-l-4 border-indigo-500'
                  : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-300'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span>Credit/Debit Card</span>
            </button>
            
            <button
              type="button"
              onClick={() => setPaymentMethod('upi')}
              className={`flex items-center justify-start p-3 rounded-lg transition-all ${
                paymentMethod === 'upi'
                  ? 'bg-indigo-500/20 text-indigo-300 border-l-4 border-indigo-500'
                  : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-300'
              }`}
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18v-6m0 0V6m0 6h6m-6 0H6" />
              </svg>
              <span>UPI</span>
            </button>
            
            <button
              type="button"
              onClick={() => setPaymentMethod('netbanking')}
              className={`flex items-center justify-start p-3 rounded-lg transition-all ${
                paymentMethod === 'netbanking'
                  ? 'bg-indigo-500/20 text-indigo-300 border-l-4 border-indigo-500'
                  : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-300'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>Net Banking</span>
            </button>
            
            <button
              type="button"
              onClick={() => setPaymentMethod('wallet')}
              className={`flex items-center justify-start p-3 rounded-lg transition-all ${
                paymentMethod === 'wallet'
                  ? 'bg-indigo-500/20 text-indigo-300 border-l-4 border-indigo-500'
                  : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-300'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Wallets</span>
            </button>
          </div>
        </div>
        
        {/* Right Side - Payment Form */}
        <div className="md:col-span-3 bg-slate-800/70 backdrop-blur-sm rounded-xl p-6 border border-slate-700/70 shadow-lg">
          <form onSubmit={handleSubmit}>
            {/* Credit/Debit Card Form */}
            {paymentMethod === 'card' && (
              <div>
                <h3 className="text-xl font-semibold text-indigo-300 mb-4 pb-2 border-b border-slate-700">Card Details</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                    <div className="bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-3 flex flex-col items-center cursor-pointer hover:border-indigo-500/50 transition-colors group">
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-2 group-hover:bg-indigo-500/20">
                        <img src="https://cdn.iconscout.com/icon/free/png-256/free-visa-3-226460.png" alt="Visa" className="h-6" />
                      </div>
                      <span className="text-sm text-slate-300 group-hover:text-indigo-300">Visa</span>
                    </div>
                    <div className="bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-3 flex flex-col items-center cursor-pointer hover:border-indigo-500/50 transition-colors group">
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-2 group-hover:bg-indigo-500/20">
                        <img src="https://cdn.iconscout.com/icon/free/png-256/free-mastercard-3-226462.png" alt="MasterCard" className="h-6" />
                      </div>
                      <span className="text-sm text-slate-300 group-hover:text-indigo-300">MasterCard</span>
                    </div>
                    <div className="bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-3 flex flex-col items-center cursor-pointer hover:border-indigo-500/50 transition-colors group">
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-2 group-hover:bg-indigo-500/20">
                        <img src="https://cdn.iconscout.com/icon/free/png-256/free-american-express-3-226461.png" alt="American Express" className="h-6" />
                      </div>
                      <span className="text-sm text-slate-300 group-hover:text-indigo-300">American Express</span>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <label htmlFor="cardNumber" className="block text-slate-300 mb-2">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        id="cardNumber"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="4123 4567 8901 2345"
                        className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                        required
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-slate-500 text-sm mt-1">For demo: Use a card number starting with 4</p>
                  </div>

                  <div>
                    <label htmlFor="cardName" className="block text-slate-300 mb-2">Name on Card</label>
                    <div className="relative">
                      <input
                        type="text"
                        id="cardName"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                        required
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="expiryDate" className="block text-slate-300 mb-2">Expiry Date</label>
                      <div className="relative">
                        <input
                          type="text"
                          id="expiryDate"
                          value={expiryDate}
                          onChange={handleExpiryDateChange}
                          placeholder="MM/YY"
                          className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                          required
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="cvv" className="block text-slate-300 mb-2">CVV</label>
                      <div className="relative">
                        <input
                          type="text"
                          id="cvv"
                          value={cvv}
                          onChange={handleCvvChange}
                          placeholder="123"
                          className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                          required
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-2 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-slate-300 text-sm">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-indigo-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Your payment information is encrypted and secure.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* UPI Form */}
            {paymentMethod === 'upi' && (
              <div>
                <h3 className="text-xl font-semibold text-indigo-300 mb-4 pb-2 border-b border-slate-700">UPI Payment</h3>
                <div className="space-y-4">
                  <div className="relative">
                    <label htmlFor="upiId" className="block text-slate-300 mb-2">UPI ID</label>
                    <div className="relative">
                      <input
                        type="text"
                        id="upiId"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="username@okaxis"
                        className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                        required
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <svg className="w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18v-6m0 0V6m0 6h6m-6 0H6" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-slate-500 text-sm mt-1">For demo: Use a UPI ID ending with @okaxis, @okicici, or @oksbi</p>
                  </div>
                  
                  <p className="text-slate-300 font-medium">Select UPI App</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-3 flex flex-col items-center cursor-pointer hover:border-indigo-500/50 transition-colors group">
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-2 group-hover:bg-indigo-500/20">
                        <img src="https://cdn.iconscout.com/icon/free/png-256/free-google-pay-2038779-1721670.png" alt="Google Pay" className="h-6" />
                      </div>
                      <span className="text-sm text-slate-300 group-hover:text-indigo-300">Google Pay</span>
                    </div>
                    <div className="bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-3 flex flex-col items-center cursor-pointer hover:border-indigo-500/50 transition-colors group">
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-2 group-hover:bg-indigo-500/20">
                        <img src="https://cdn.iconscout.com/icon/free/png-256/free-phonepe-1649744-1399663.png" alt="PhonePe" className="h-6" />
                      </div>
                      <span className="text-sm text-slate-300 group-hover:text-indigo-300">PhonePe</span>
                    </div>
                    <div className="bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-3 flex flex-col items-center cursor-pointer hover:border-indigo-500/50 transition-colors group">
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-2 group-hover:bg-indigo-500/20">
                        <img src="https://cdn.iconscout.com/icon/free/png-256/free-paytm-226448.png" alt="Paytm" className="h-6" />
                      </div>
                      <span className="text-sm text-slate-300 group-hover:text-indigo-300">Paytm</span>
                    </div>
                    <div className="bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-3 flex flex-col items-center cursor-pointer hover:border-indigo-500/50 transition-colors group">
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-2 group-hover:bg-indigo-500/20">
                        <img src="https://cdn.iconscout.com/icon/free/png-256/free-bhim-3-858293.png" alt="BHIM" className="h-6" />
                      </div>
                      <span className="text-sm text-slate-300 group-hover:text-indigo-300">BHIM</span>
                    </div>
                  </div>
                  
                  <div className="mt-2 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-slate-300 text-sm">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-indigo-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Enter your UPI ID or select a UPI app to make a payment. A payment request will be sent to your UPI app.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Net Banking Form */}
            {paymentMethod === 'netbanking' && (
              <div>
                <h3 className="text-xl font-semibold text-indigo-300 mb-4 pb-2 border-b border-slate-700">Net Banking</h3>
                <div className="space-y-4">
                  <div className="relative">
                    <label htmlFor="bank" className="block text-slate-300 mb-2">Select Your Bank</label>
                    <div className="relative">
                      <select
                        id="bank"
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white appearance-none"
                        required
                      >
                        <option value="">Select a bank</option>
                        {banks.map(bank => (
                          <option key={bank.id} value={bank.id}>{bank.name}</option>
                        ))}
                      </select>
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-slate-300 font-medium mt-2">Popular Banks</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div 
                      onClick={() => setSelectedBank('sbi')}
                      className={`bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-3 flex flex-col items-center cursor-pointer hover:border-indigo-500/50 transition-colors group ${
                        selectedBank === 'sbi' ? 'border-indigo-500 bg-indigo-500/10' : ''
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full bg-white flex items-center justify-center mb-2 ${
                        selectedBank === 'sbi' ? 'bg-indigo-500/20' : ''
                      }`}>
                        <img src="https://cdn.iconscout.com/icon/free/png-256/free-sbi-282446.png" alt="State Bank of India" className="h-6" />
                      </div>
                      <span className="text-sm text-slate-300 group-hover:text-indigo-300">State Bank</span>
                    </div>
                    <div 
                      onClick={() => setSelectedBank('hdfc')}
                      className={`bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-3 flex flex-col items-center cursor-pointer hover:border-indigo-500/50 transition-colors group ${
                        selectedBank === 'hdfc' ? 'border-indigo-500 bg-indigo-500/10' : ''
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full bg-white flex items-center justify-center mb-2 ${
                        selectedBank === 'hdfc' ? 'bg-indigo-500/20' : ''
                      }`}>
                        <img src="https://cdn.iconscout.com/icon/free/png-256/free-hdfc-bank-282739.png" alt="HDFC Bank" className="h-6" />
                      </div>
                      <span className="text-sm text-slate-300 group-hover:text-indigo-300">HDFC Bank</span>
                    </div>
                    <div 
                      onClick={() => setSelectedBank('icici')}
                      className={`bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-3 flex flex-col items-center cursor-pointer hover:border-indigo-500/50 transition-colors group ${
                        selectedBank === 'icici' ? 'border-indigo-500 bg-indigo-500/10' : ''
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full bg-white flex items-center justify-center mb-2 ${
                        selectedBank === 'icici' ? 'bg-indigo-500/20' : ''
                      }`}>
                        <img src="https://cdn.iconscout.com/icon/free/png-256/free-icici-bank-282777.png" alt="ICICI Bank" className="h-6" />
                      </div>
                      <span className="text-sm text-slate-300 group-hover:text-indigo-300">ICICI Bank</span>
                    </div>
                    <div 
                      onClick={() => setSelectedBank('axis')}
                      className={`bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-3 flex flex-col items-center cursor-pointer hover:border-indigo-500/50 transition-colors group ${
                        selectedBank === 'axis' ? 'border-indigo-500 bg-indigo-500/10' : ''
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full bg-white flex items-center justify-center mb-2 ${
                        selectedBank === 'axis' ? 'bg-indigo-500/20' : ''
                      }`}>
                        <img src="https://cdn.iconscout.com/icon/free/png-256/free-axis-bank-283095.png" alt="Axis Bank" className="h-6" />
                      </div>
                      <span className="text-sm text-slate-300 group-hover:text-indigo-300">Axis Bank</span>
                    </div>
                    <div 
                      onClick={() => setSelectedBank('kotak')}
                      className={`bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-3 flex flex-col items-center cursor-pointer hover:border-indigo-500/50 transition-colors group ${
                        selectedBank === 'kotak' ? 'border-indigo-500 bg-indigo-500/10' : ''
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full bg-white flex items-center justify-center mb-2 ${
                        selectedBank === 'kotak' ? 'bg-indigo-500/20' : ''
                      }`}>
                        <img src="https://cdn.iconscout.com/icon/free/png-256/free-kotak-bank-283102.png" alt="Kotak Bank" className="h-6" />
                      </div>
                      <span className="text-sm text-slate-300 group-hover:text-indigo-300">Kotak Bank</span>
                    </div>
                    <div 
                      onClick={() => setSelectedBank('pnb')}
                      className={`bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-3 flex flex-col items-center cursor-pointer hover:border-indigo-500/50 transition-colors group ${
                        selectedBank === 'pnb' ? 'border-indigo-500 bg-indigo-500/10' : ''
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full bg-white flex items-center justify-center mb-2 ${
                        selectedBank === 'pnb' ? 'bg-indigo-500/20' : ''
                      }`}>
                        <img src="https://cdn.iconscout.com/icon/free/png-256/free-pnb-282791.png" alt="Punjab National Bank" className="h-6" />
                      </div>
                      <span className="text-sm text-slate-300 group-hover:text-indigo-300">PNB</span>
                    </div>
                  </div>
                  
                  <div className="mt-2 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-slate-300 text-sm">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-indigo-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>You will be redirected to your bank's website to complete the payment.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Wallets Form */}
            {paymentMethod === 'wallet' && (
              <div>
                <h3 className="text-xl font-semibold text-indigo-300 mb-4 pb-2 border-b border-slate-700">Digital Wallets</h3>
                <div className="space-y-4">
                  <p className="text-slate-300">Choose your preferred wallet to make the payment</p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {wallets.map(wallet => (
                      <div 
                        key={wallet.id}
                        onClick={() => setSelectedWallet(wallet.id)}
                        className={`p-4 rounded-xl border cursor-pointer flex flex-col items-center transition-all ${
                          selectedWallet === wallet.id
                            ? 'border-indigo-500 bg-indigo-500/10 text-white'
                            : 'border-slate-700 bg-gradient-to-b from-slate-800 to-slate-900 text-slate-300 hover:border-indigo-500/30'
                        }`}
                      >
                        <div className={`w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center mb-2 ${
                          selectedWallet === wallet.id ? 'bg-indigo-500/20' : 'bg-white/5'
                        }`}>
                          {wallet.id === 'paytm' && (
                            <img src="https://cdn.iconscout.com/icon/free/png-256/free-paytm-226448.png" alt="Paytm" className="h-6" />
                          )}
                          {wallet.id === 'phonepe' && (
                            <img src="https://cdn.iconscout.com/icon/free/png-256/free-phonepe-1649744-1399663.png" alt="PhonePe" className="h-6" />
                          )}
                          {wallet.id === 'gpay' && (
                            <img src="https://cdn.iconscout.com/icon/free/png-256/free-google-pay-2038779-1721670.png" alt="Google Pay" className="h-6" />
                          )}
                          {wallet.id === 'amazonpay' && (
                            <img src="https://cdn.iconscout.com/icon/free/png-256/free-amazon-pay-1649771-1399690.png" alt="Amazon Pay" className="h-6" />
                          )}
                          {wallet.id === 'mobikwik' && (
                            <img src="https://cdn.iconscout.com/icon/free/png-256/free-mobikwik-283657.png" alt="MobiKwik" className="h-6" />
                          )}
                        </div>
                        <span className="text-sm font-medium">{wallet.name}</span>
                        {selectedWallet === wallet.id && (
                          <div className="mt-2 text-xs px-2 py-1 bg-indigo-500/30 rounded-full text-indigo-300">Selected</div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-2 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-slate-300 text-sm">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-indigo-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>You will be redirected to your selected wallet to complete the payment.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-red-400">{error}</span>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                type="button"
                onClick={onCancel}
                className="py-3 px-6 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium transition-all flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="flex-1 py-3 px-6 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <span>Pay ₹{amount.toFixed(2)}</span>
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default PaymentGateway; 