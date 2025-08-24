'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { signUp } from '@/lib/supabaseClient';

// Main signup component
function SignupContent() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [weddingToClaim, setWeddingToClaim] = useState<string | null>(null);
  const [weddingData, setWeddingData] = useState<any>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Check if there's a wedding_id parameter
    const weddingId = searchParams.get('wedding_id');
    if (weddingId) {
      setWeddingToClaim(weddingId);
      
      // Get wedding data to display info about the site being claimed
      try {
        const storedWeddings = JSON.parse(localStorage.getItem('weddings') || '{}');
        if (storedWeddings[weddingId]) {
          setWeddingData(storedWeddings[weddingId]);
        }
      } catch (error) {
        console.error('Error loading wedding data:', error);
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Try to sign up with Supabase
      const { error: signUpError } = await signUp(email, password, firstName, lastName);
      
      if (signUpError) {
        console.warn('Supabase auth not fully configured, using fallback local auth');
        
        // Fallback to localStorage for demo
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        
        // Check if email already exists
        if (users[email]) {
          setError('Email already in use. Please sign in instead.');
          setIsLoading(false);
          return;
        }
        
        // Create new user
        users[email] = {
          firstName,
          lastName,
          email,
          password,
          createdAt: new Date().toISOString()
        };
        
        localStorage.setItem('users', JSON.stringify(users));
        
        // Set current user in localStorage for demo purposes
        localStorage.setItem('currentUser', JSON.stringify({
          email,
          firstName,
          lastName,
          isLoggedIn: true
        }));
        
        // If there's a wedding to claim, claim it
        if (weddingToClaim) {
          try {
            const storedWeddings = JSON.parse(localStorage.getItem('weddings') || '{}');
            if (storedWeddings[weddingToClaim]) {
              // Check if site is already claimed by someone else
              if (storedWeddings[weddingToClaim].claimed && 
                  storedWeddings[weddingToClaim].email !== email) {
                setError('This wedding site has already been claimed by another user.');
                setIsLoading(false);
                return;
              }
              
              // Update the wedding data to mark it as claimed
              storedWeddings[weddingToClaim].claimed = true;
              storedWeddings[weddingToClaim].email = email;
              storedWeddings[weddingToClaim].userId = email;
              
              // Remove expiration
              delete storedWeddings[weddingToClaim].expiresAt;
              
              // Add to user's wedding sites list
              if (!users[email].weddingSites) {
                users[email].weddingSites = [];
              }
              
              users[email].weddingSites.push(weddingToClaim);
              localStorage.setItem('users', JSON.stringify(users));
              localStorage.setItem('weddings', JSON.stringify(storedWeddings));
              
              // Redirect to admin page for this wedding
              router.push(`/admin/${weddingToClaim}`);
              return;
            }
          } catch (error) {
            console.error('Error claiming wedding site:', error);
          }
        }
      }
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Error during signup:', err);
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
          <Link
            href="/login"
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <div className="text-center mb-8">
              <h1 className="font-playfair text-3xl font-light text-gray-900 mb-2">
                Create Your Account
              </h1>
              <p className="text-gray-600">
                {weddingToClaim 
                  ? "Sign up to claim your wedding website" 
                  : "Sign up to create your wedding website"}
              </p>
            </div>
            
            {/* Wedding site claiming info */}
            {weddingToClaim && weddingData && (
              <div className="mb-6 bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                <h3 className="font-medium text-emerald-800 mb-2">
                  You're claiming a wedding website
                </h3>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500">
                    💍
                  </div>
                  <div className="font-medium">
                    {weddingData.coupleNames || 'Wedding Site'}
                  </div>
                </div>
                <p className="text-sm text-emerald-600 mb-2">
                  Create an account to claim this wedding site and save it permanently.
                </p>
                <div className="text-xs text-gray-500">
                  Wedding ID: {weddingToClaim}
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Must be at least 8 characters
                </p>
              </div>

              <div className="flex items-center">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                  I agree to the <a href="#" className="text-emerald-600 hover:text-emerald-700">Terms of Service</a> and <a href="#" className="text-emerald-600 hover:text-emerald-700">Privacy Policy</a>
                </label>
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
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Sign In
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

// Wrap the page in Suspense
export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
    </div>}>
      <SignupContent />
    </Suspense>
  );
}