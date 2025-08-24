'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';

export default function WeddingLoginPage() {
  const [weddingId, setWeddingId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Check if wedding exists in localStorage
      const existingWeddings = JSON.parse(localStorage.getItem('weddings') || '{}');
      
      if (existingWeddings[weddingId]) {
        // Redirect to wedding page
        router.push(`/wedding/${weddingId}`);
      } else {
        setError('Wedding ID not found');
      }
    } catch (err) {
      console.error('Error accessing wedding:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Logo size="sm" className="text-black" />
          </Link>
          <div className="space-x-4">
            <Link
              href="/login"
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 font-medium"
            >
              Create Account
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <div className="text-center mb-8">
              <h1 className="font-playfair text-3xl font-light text-gray-900 mb-2">
                Access Wedding Website
              </h1>
              <p className="text-gray-600">
                Enter the Wedding ID to view the site
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="weddingId" className="block text-sm font-medium text-gray-700 mb-1">
                  Wedding ID
                </label>
                <input
                  id="weddingId"
                  type="text"
                  value={weddingId}
                  onChange={(e) => setWeddingId(e.target.value)}
                  placeholder="e.g., abc123"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <p className="mt-2 text-xs text-gray-500">
                  This is the unique identifier for the wedding website. You should have received this from the couple.
                </p>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 rounded-lg font-medium text-white ${
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {isLoading ? 'Accessing...' : 'Access Wedding Site'}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Planning your wedding?{' '}
                <Link
                  href="/signup"
                  className="text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Create your own wedding website
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <p className="text-sm text-gray-500 text-center">
            © {new Date().getFullYear()} Bind8. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
