'use client';

import { useState } from 'react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  weddingId: string;
}

export default function PaymentModal({ isOpen, onClose, onSuccess, weddingId }: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'details' | 'processing' | 'success' | 'error'>('details');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setPaymentStep('processing');

    // Simulate payment processing
    setTimeout(() => {
      // Simulate successful payment
      if (cardNumber.length >= 13) {
        setPaymentStep('success');
        
        // Update wedding data in localStorage to mark as premium
        try {
          const storedWeddings = JSON.parse(localStorage.getItem('weddings') || '{}');
          if (storedWeddings[weddingId]) {
            storedWeddings[weddingId].isPremium = true;
            storedWeddings[weddingId].premiumPurchaseDate = new Date().toISOString();
            localStorage.setItem('weddings', JSON.stringify(storedWeddings));
          }
        } catch (error) {
          console.error('Error updating wedding data:', error);
        }
      } else {
        setPaymentStep('error');
      }
      setIsProcessing(false);
    }, 2000);
  };

  const renderPaymentStep = () => {
    switch (paymentStep) {
      case 'details':
        return (
          <>
            <div className="mb-6 text-center">
              <h3 className="text-xl font-medium text-gray-900 mb-2">Upgrade to Premium</h3>
              <p className="text-gray-600">Enjoy unlimited access and premium features for just $29</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                  maxLength={16}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  placeholder="John Smith"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                    maxLength={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-emerald-500 text-white py-2 px-4 rounded-md hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  Pay $29
                </button>
              </div>
              <div className="text-center text-sm text-gray-500">
                <p>🔒 Your payment information is secure</p>
              </div>
            </form>
          </>
        );

      case 'processing':
        return (
          <div className="py-8 text-center">
            <div className="w-16 h-16 mx-auto border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Processing Payment</h3>
            <p className="text-gray-600">Please wait while we process your payment...</p>
          </div>
        );

      case 'success':
        return (
          <div className="py-8 text-center">
            <div className="w-16 h-16 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-2xl mb-4">
              ✓
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Payment Successful!</h3>
            <p className="text-gray-600 mb-6">
              Thank you for upgrading to Premium. Your wedding website will now be available forever.
            </p>
            <button
              onClick={() => {
                onSuccess();
                onClose();
              }}
              className="bg-emerald-500 text-white py-2 px-6 rounded-md hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              Continue to Dashboard
            </button>
          </div>
        );

      case 'error':
        return (
          <div className="py-8 text-center">
            <div className="w-16 h-16 mx-auto bg-red-100 text-red-600 rounded-full flex items-center justify-center text-2xl mb-4">
              ✗
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Payment Failed</h3>
            <p className="text-gray-600 mb-6">
              We couldn't process your payment. Please check your card details and try again.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setPaymentStep('details')}
                className="bg-emerald-500 text-white py-2 px-6 rounded-md hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                Try Again
              </button>
              <button
                onClick={onClose}
                className="bg-gray-200 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
        {paymentStep !== 'processing' && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            disabled={isProcessing}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        {renderPaymentStep()}
      </div>
    </div>
  );
}
