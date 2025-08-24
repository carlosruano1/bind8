'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Logo from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';

// Main page component
function SuccessContent() {
  const searchParams = useSearchParams();
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [weddingId, setWeddingId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [weddingData, setWeddingData] = useState<any>(null);
  const [expiresIn, setExpiresIn] = useState<string>('');
  const { user } = useAuth();

  useEffect(() => {
    // Get the wedding ID from URL params
    const id = searchParams.get('id');
    
    if (id) {
      setWeddingId(id);
      setWebsiteUrl(`http://localhost:3000/wedding/${id}`);
      
      // Get wedding data to display expiration information
      try {
        const storedWeddings = JSON.parse(localStorage.getItem('weddings') || '{}');
        if (storedWeddings[id]) {
          setWeddingData(storedWeddings[id]);
          
          // Calculate time until expiration
          if (!storedWeddings[id].claimed && storedWeddings[id].expiresAt) {
            const expirationDate = new Date(storedWeddings[id].expiresAt);
            const now = new Date();
            const hoursRemaining = Math.max(0, Math.round((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60)));
            
            if (hoursRemaining <= 1) {
              setExpiresIn('less than 1 hour');
            } else if (hoursRemaining < 24) {
              setExpiresIn(`${hoursRemaining} hours`);
            } else {
              setExpiresIn('24 hours');
            }
          }
        }
      } catch (error) {
        console.error('Error loading wedding data:', error);
      }
      
      setIsLoading(false);
    } else {
      // Fallback for demo purposes
      const uniqueId = Math.random().toString(36).substring(2, 8);
      setWeddingId(uniqueId);
      setWebsiteUrl(`http://localhost:3000/wedding/${uniqueId}`);
      setExpiresIn('24 hours');
      setIsLoading(false);
    }
  }, [searchParams]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(websiteUrl);
    // You could add a toast notification here
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Our Wedding Website',
        text: 'Check out our wedding website!',
        url: websiteUrl,
      });
    } else {
      handleCopyUrl();
    }
  };

  const renderStickyExpiration = () => {
    if (isLoading || user || !weddingId) return null;
    
    return (
      <div className="sticky top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg transform transition-all duration-500">
        <div className="max-w-4xl mx-auto px-6 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center mb-2 sm:mb-0">
              <div className="mr-3 text-2xl animate-pulse">⏳</div>
              <div>
                <p className="font-medium">Your wedding site will expire in <span className="font-bold">{expiresIn}</span></p>
                <p className="text-xs text-amber-100">Create an account to save it forever</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <a 
                href={`/signup?wedding_id=${weddingId}`}
                className="bg-white text-amber-700 px-4 py-1.5 rounded font-medium hover:bg-amber-50 transition-colors text-sm"
              >
                Sign Up Now
              </a>
              <a
                href={`/login?wedding_id=${weddingId}`}
                className="bg-amber-700 text-white px-4 py-1.5 rounded font-medium hover:bg-amber-800 border border-amber-400 transition-colors text-sm"
              >
                Login
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      {/* Sticky Expiration Warning */}
      {renderStickyExpiration()}
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Logo size="md" className="text-black" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center">
          {/* Success Animation */}
          <div className="mb-8">
            {isLoading ? (
              <div className="w-24 h-24 mx-auto border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
            ) : (
              <div className="w-24 h-24 mx-auto bg-emerald-500 rounded-full flex items-center justify-center text-white text-4xl animate-bounce">
                ✨
              </div>
            )}
          </div>

          {/* Success Message */}
          <h1 className="font-playfair text-4xl md:text-5xl font-light text-gray-900 mb-6">
            {isLoading ? 'Creating Your Website...' : 'Website Created Successfully!'}
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            {isLoading 
              ? 'We\'re putting the finishing touches on your beautiful wedding website...'
              : 'Your wedding website is now live and ready to share with your loved ones!'
            }
          </p>

          {/* Website URL */}
          {!isLoading && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="font-playfair text-2xl font-light text-gray-900 mb-4">
                Your Wedding Website
              </h2>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 bg-gray-50 rounded-lg p-4">
                  <code className="text-emerald-600 font-mono text-lg break-all">
                    {websiteUrl}
                  </code>
                </div>
                <button
                  onClick={handleCopyUrl}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Copy
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleShare}
                  className="bg-emerald-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-emerald-600 transition-colors"
                >
                  Share Website
                </button>
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-emerald-500 text-emerald-500 px-8 py-3 rounded-lg font-medium hover:bg-emerald-50 transition-colors"
                >
                  View Website
                </a>
              </div>
            </div>
          )}

          {/* Important Notice */}
          {!isLoading && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 mb-8">
              <div className="flex items-start">
                <div className="text-amber-500 text-2xl mr-4 mt-1">⏰</div>
                <div>
                  <h3 className="font-playfair text-xl font-light text-amber-900 mb-3">
                    Important: Website Expiration
                  </h3>
                  <p className="text-amber-700 mb-4">
                    <strong>Your free website will be automatically deleted 30 days after your wedding date</strong> to keep our service fast and affordable for everyone.
                  </p>
                  <div className="bg-white rounded-lg p-4 border border-amber-300">
                    <p className="text-amber-800 text-sm mb-3">
                      💡 <strong>Want to keep your memories forever?</strong>
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button className="bg-amber-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-amber-700 transition-colors text-sm">
                        Upgrade to Premium ($29)
                      </button>
                      <span className="text-amber-700 text-sm flex items-center">
                        ✨ Permanent website • Custom domain • Advanced analytics
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Your Wedding Site Section */}
          {!isLoading && !user && (
            <div className="bg-white shadow-md rounded-2xl p-8 mb-8 border border-gray-200">
              <h3 className="font-playfair text-2xl font-light text-gray-900 mb-3 text-center">
                Save Your Wedding Site
              </h3>
              
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 mb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-xl">
                        🔑
                      </div>
                      <h4 className="font-medium text-gray-800">Your Wedding ID</h4>
                    </div>
                    <div className="bg-white p-3 rounded-lg font-mono text-lg text-emerald-600 mb-2 border border-gray-200 text-center">
                      {weddingId}
                    </div>
                    <p className="text-sm text-gray-600">
                      This is your unique website identifier.
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      <span className="inline-block mr-1">⏱️</span> Expires in {expiresIn}
                    </div>
                    <a
                      href={`/login?wedding_id=${weddingId}`}
                      className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                    >
                      Already have an account?
                    </a>
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col">
                  <div className="bg-emerald-50 rounded-lg p-6 border border-emerald-100 mb-4 flex-grow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-xl">
                        🔒
                      </div>
                      <h4 className="font-medium text-emerald-800">Create an Account</h4>
                    </div>
                    <p className="text-emerald-700 mb-4">
                      Secure your wedding site and unlock premium features by creating a free account.
                    </p>
                    <ul className="text-sm text-emerald-700 mb-6">
                      <li className="flex items-center mb-2">
                        <span className="mr-2">✓</span> Save your site permanently
                      </li>
                      <li className="flex items-center mb-2">
                        <span className="mr-2">✓</span> Edit content anytime
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">✓</span> Track guest RSVPs
                      </li>
                    </ul>
                  </div>
                  <a
                    href={`/signup?wedding_id=${weddingId}`}
                    className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors text-center"
                  >
                    Create Free Account
                  </a>
                </div>
              </div>
            </div>
          )}
          
          {/* For logged in users */}
          {!isLoading && user && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 mb-8">
              <h3 className="font-playfair text-2xl font-light text-emerald-900 mb-4">
                Manage Your Wedding Website
              </h3>
              <p className="text-emerald-700 mb-6">
                Your wedding site has been successfully created and is associated with your account.
              </p>
              <div className="flex justify-center">
                <a
                  href={`/admin/${weddingId}`}
                  className="bg-emerald-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-emerald-600 transition-colors"
                >
                  Go to Admin Dashboard
                </a>
              </div>
            </div>
          )}

          {/* Next Steps */}
          {!isLoading && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="font-playfair text-2xl font-light text-gray-900 mb-6">
                What's Next?
              </h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📱</span>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Share with Guests</h4>
                  <p className="text-sm text-gray-600">
                    Send the link to your family and friends so they can RSVP and see your story.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">✏️</span>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Customize Further</h4>
                  <p className="text-sm text-gray-600">
                    Add more photos, update details, or change the design anytime.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Track RSVPs</h4>
                  <p className="text-sm text-gray-600">
                    Monitor guest responses and manage your guest list easily.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Back to Home */}
          <div className="mt-12">
            <a
              href="/"
              className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © 2024 Bind8. All rights reserved.
            </p>
            
            {/* Made with Bind8 */}
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <span>Made with</span>
              <a 
                href="https://bind8.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-gray-700 transition-colors duration-300 group"
              >
                <Logo size="sm" className="text-gray-500" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Wrap the page in Suspense
export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
