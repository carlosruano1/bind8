'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { getExpirationStatus } from '@/lib/expirationUtils';

interface WeddingSite {
  id: string;
  coupleNames: string;
  weddingDate: string;
  venue: string;
  isPremium: boolean;
  createdAt: string;
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [weddingSites, setWeddingSites] = useState<WeddingSite[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const currentUser = localStorage.getItem('currentUser');
    
    if (!currentUser) {
      router.push('/login');
      return;
    }
    
    const parsedUser = JSON.parse(currentUser);
    setUser(parsedUser);
    
    // Load user's wedding sites
    loadUserWeddingSites(parsedUser.email);
    
    setIsLoading(false);
  }, [router]);

  const loadUserWeddingSites = (userEmail: string) => {
    try {
      const allWeddings = JSON.parse(localStorage.getItem('weddings') || '{}');
      const userWeddings: WeddingSite[] = [];
      
      Object.entries(allWeddings).forEach(([id, data]: [string, any]) => {
        if (data.email === userEmail) {
          userWeddings.push({
            id,
            coupleNames: data.coupleNames,
            weddingDate: data.weddingDate,
            venue: data.venue,
            isPremium: !!data.isPremium,
            createdAt: data.createdAt
          });
        }
      });
      
      setWeddingSites(userWeddings);
    } catch (error) {
      console.error('Error loading wedding sites:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard">
            <Logo size="sm" className="text-black" />
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">
              {user?.firstName} {user?.lastName}
            </span>
            <button 
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-600 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-medium text-gray-900 mb-2">
            Welcome, {user?.firstName}!
          </h1>
          <p className="text-gray-600">
            Manage your wedding websites and create new ones.
          </p>
        </div>

        {/* Create New Button */}
        <div className="mb-8">
          <Link
            href="/create"
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create New Wedding Website
          </Link>
        </div>

        {/* Wedding Sites */}
        <div>
          <h2 className="text-xl font-medium text-gray-900 mb-4">
            Your Wedding Websites
          </h2>

          {weddingSites.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-200">
              <div className="text-6xl mb-4">💍</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No Wedding Websites Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first wedding website to get started.
              </p>
              <Link
                href="/create"
                className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Create Wedding Website
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {weddingSites.map((site) => (
                <div key={site.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="h-40 bg-gradient-to-r from-emerald-500 to-blue-500 relative">
                    {site.isPremium && (
                      <div className="absolute top-2 right-2 bg-amber-600 text-white px-2 py-1 rounded-lg text-xs font-medium">
                        Premium
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <h3 className="font-playfair text-2xl font-light text-white text-center px-4">
                        {site.coupleNames || 'Wedding Site'}
                      </h3>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-4">
                      <div className="text-gray-600 text-sm mb-1">Wedding Date</div>
                      <div className="font-medium">
                        {site.weddingDate ? new Date(site.weddingDate).toLocaleDateString() : 'Not set'}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="text-gray-600 text-sm mb-1">Venue</div>
                      <div className="font-medium">
                        {site.venue || 'Not set'}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="text-gray-600 text-sm mb-1">Status</div>
                      <div className={`font-medium ${site.isPremium ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {site.isPremium ? 'Premium - Never Expires' : getExpirationStatus(site)}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2 mt-6">
                      <Link
                        href={`/admin/${site.id}`}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-center flex-1"
                      >
                        Manage
                      </Link>
                      <Link
                        href={`/wedding/${site.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white text-emerald-600 px-4 py-2 rounded-lg border border-emerald-600 hover:bg-emerald-50 transition-colors text-center flex-1"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* After wedding sites list */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Recommended Wedding Planners</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockPlanners.map(planner => (
              <div key={planner.id} className="p-4 border rounded-lg">
                <h3>{planner.name}</h3>
                <p>Specialties: {planner.specialties.join(', ')}</p>
                <button>Contact</button>
              </div>
            ))}
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
