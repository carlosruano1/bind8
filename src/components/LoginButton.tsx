'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signUp, getWedding } from '@/lib/supabaseClient';

export default function LoginButton() {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [weddingId, setWeddingId] = useState('');
  const [isSignIn, setIsSignIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      if (isSignIn) {
        // For now, we'll keep the localStorage approach for demo purposes
        // but simulate a more realistic flow
        const existingWeddings = JSON.parse(localStorage.getItem('weddings') || '{}');
        
        if (existingWeddings[weddingId] && existingWeddings[weddingId].email === email) {
          // Simulate successful sign-in
          const { error: signInError } = await signIn(email, password);
          
          if (signInError) {
            console.warn('Supabase auth not fully configured, using fallback local auth');
          }
          
          // Save auth state in localStorage for demo purposes
          localStorage.setItem('currentUser', JSON.stringify({
            email,
            weddingId
          }));
          
          // Redirect to admin page
          router.push(`/admin/${weddingId}`);
        } else {
          setError('Invalid wedding ID or email');
        }
      } else {
        // For registration
        // First check if wedding exists in localStorage
        const existingWeddings = JSON.parse(localStorage.getItem('weddings') || '{}');
        
        if (existingWeddings[weddingId]) {
          // Try to sign up with Supabase
          const { error: signUpError } = await signUp(email, password);
          
          if (signUpError) {
            console.warn('Supabase auth not fully configured, using fallback local auth');
          }
          
          // Update the wedding with the email
          existingWeddings[weddingId].email = email;
          localStorage.setItem('weddings', JSON.stringify(existingWeddings));
          
          // Save auth state in localStorage for demo purposes
          localStorage.setItem('currentUser', JSON.stringify({
            email,
            weddingId
          }));
          
          // Redirect to admin page
          router.push(`/admin/${weddingId}`);
        } else {
          setError('Wedding ID not found');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-white text-emerald-600 font-medium px-5 py-2.5 rounded-lg hover:bg-emerald-50 transition-colors"
      >
        Login
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-playfair font-light text-gray-900">
                {isSignIn ? 'Sign in to your account' : 'Register your wedding site'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wedding ID
                </label>
                <input
                  type="text"
                  value={weddingId}
                  onChange={(e) => setWeddingId(e.target.value)}
                  placeholder="e.g., abc123"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">
                  You received this when you created your wedding website
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded-lg font-medium text-white ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {isLoading
                  ? 'Processing...'
                  : isSignIn
                  ? 'Sign In'
                  : 'Register'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => setIsSignIn(!isSignIn)}
                className="text-sm text-emerald-600 hover:text-emerald-700"
              >
                {isSignIn
                  ? "Don't have an account yet? Register"
                  : 'Already registered? Sign in'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
