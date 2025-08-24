'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import PaymentModal from '@/components/PaymentModal';
import SiteContentEditor from '@/components/SiteContentEditor';
import PhotoManager from '@/components/PhotoManager';
import { useAuth } from '@/contexts/AuthContext';

interface Guest {
  name: string;
  email?: string;
  rsvp?: 'yes' | 'no' | 'pending';
  plusOne?: boolean;
  dietaryRequirements?: string;
}

interface AdminStats {
  totalInvited: number;
  attending: number;
  notAttending: number;
  pending: number;
  responseRate: number;
}

export default function AdminPage() {
  const params = useParams();
  const weddingId = params.id as string;
  
  const [weddingData, setWeddingData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { user, loading, checkAuth } = useAuth();
  const [saveSuccess, setSaveSuccess] = useState('');
  const [stats, setStats] = useState<AdminStats>({
    totalInvited: 0,
    attending: 0,
    notAttending: 0,
    pending: 0,
    responseRate: 0
  });
  const [editingGuest, setEditingGuest] = useState<{index: number, name: string, email: string} | null>(null);
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestEmail, setNewGuestEmail] = useState('');
  
  // Calculate stats whenever guests change
  useEffect(() => {
    if (guests.length > 0) {
      const attending = guests.filter(g => g.rsvp === 'yes').length;
      const notAttending = guests.filter(g => g.rsvp === 'no').length;
      const pending = guests.filter(g => g.rsvp === 'pending').length;
      
      setStats({
        totalInvited: guests.length,
        attending,
        notAttending,
        pending,
        responseRate: guests.length > 0 
          ? ((attending + notAttending) / guests.length) * 100 
          : 0
      });
    }
  }, [guests]);

  useEffect(() => {
    const verifyAuthAndLoadData = async () => {
      // Check authentication first
      const isAuthenticated = await checkAuth();
      setIsCheckingAuth(false);
      
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }
      
      // Load wedding data from localStorage
      try {
        const storedWeddings = JSON.parse(localStorage.getItem('weddings') || '{}');
        const wedding = storedWeddings[weddingId];
        
        if (wedding) {
          // For unclaimed sites or sites belonging to the user
          if (!wedding.claimed || (user && wedding.email === user.email)) {
            setWeddingData(wedding);
            
            // Check if premium
            setIsPremium(!!wedding.isPremium);
            
            // Load the unified guest list
            const guestList = wedding.guestList || [];
            
            // Check if we have the new format guest list
            const storedGuests = localStorage.getItem(`guests_${weddingId}`);
            let enhancedGuests;
            
            if (storedGuests) {
              // Use the new format guest list
              enhancedGuests = JSON.parse(storedGuests);
              
              // Make sure all guests from the wedding data are included
              // (in case new ones were added to the wedding data but not the guest list)
              const existingNames = enhancedGuests.map((g: Guest) => g.name.toLowerCase());
              const newGuests = guestList
                .filter((name: string) => !existingNames.includes(name.toLowerCase()))
                .map((name: string) => ({
                  name,
                  rsvp: 'pending' as const
                }));
              
              if (newGuests.length > 0) {
                enhancedGuests = [...enhancedGuests, ...newGuests];
                // Save the updated list
                localStorage.setItem(`guests_${weddingId}`, JSON.stringify(enhancedGuests));
              }
            } else {
              // Check for legacy RSVP data
              const storedRsvps = localStorage.getItem(`rsvps_${weddingId}`);
              
              if (storedRsvps) {
                // Convert old RSVPs to new Guest format
                const oldRsvps = JSON.parse(storedRsvps);
                const convertedGuests: Guest[] = [];
                
                // First add all guests from the guest list
                guestList.forEach((name: string) => {
                  // Check if this guest has an RSVP
                  const existingRsvp = oldRsvps.find((rsvp: any) => 
                    rsvp.guestName.toLowerCase() === name.toLowerCase()
                  );
                  
                  if (existingRsvp) {
                    // Convert from old format
                    convertedGuests.push({
                      name,
                      email: existingRsvp.email,
                      rsvp: existingRsvp.attending ? 'yes' : 'no',
                      plusOne: existingRsvp.numberOfGuests > 1,
                      plusOneName: existingRsvp.plusOneName,
                      dietaryRestrictions: existingRsvp.dietaryRestrictions,
                      songSuggestion: existingRsvp.songSuggestion,
                      submittedAt: existingRsvp.submittedAt
                    });
                  } else {
                    // Add with default values
                    convertedGuests.push({
                      name,
                      rsvp: 'pending'
                    });
                  }
                });
                
                // Add any RSVPs that don't match the guest list
                oldRsvps.forEach((rsvp: any) => {
                  const exists = convertedGuests.some(guest => 
                    guest.name.toLowerCase() === rsvp.guestName.toLowerCase()
                  );
                  
                  if (!exists) {
                    convertedGuests.push({
                      name: rsvp.guestName,
                      email: rsvp.email,
                      rsvp: rsvp.attending ? 'yes' : 'no',
                      plusOne: rsvp.numberOfGuests > 1,
                      plusOneName: rsvp.plusOneName,
                      dietaryRestrictions: rsvp.dietaryRestrictions,
                      songSuggestion: rsvp.songSuggestion,
                      submittedAt: rsvp.submittedAt
                    });
                  }
                });
                
                enhancedGuests = convertedGuests;
              } else {
                // No existing data, create from guest list
                enhancedGuests = guestList.map((name: string) => ({
                  name,
                  rsvp: 'pending' as const
                }));
              }
              
              // Save in the new format
              localStorage.setItem(`guests_${weddingId}`, JSON.stringify(enhancedGuests));
            }
            
            setGuests(enhancedGuests);
            
            // Stats calculation moved to a separate useEffect
          } else {
            // This wedding doesn't belong to the current user
            setWeddingData(null);
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading wedding data:', error);
        setIsLoading(false);
      }
    };
    
    verifyAuthAndLoadData();
  }, [weddingId, checkAuth, user]);

  // Function to save wedding data updates
  const saveWeddingData = (updatedData: any) => {
    try {
      // Update localStorage
      const storedWeddings = JSON.parse(localStorage.getItem('weddings') || '{}');
      storedWeddings[weddingId] = updatedData;
      localStorage.setItem('weddings', JSON.stringify(storedWeddings));
      
      // Update state
      setWeddingData(updatedData);
      
      // Show success message
      setSaveSuccess('Changes saved successfully!');
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving wedding data:', error);
      setSaveSuccess('Error saving changes. Please try again.');
    }
  };

  // Loading state
  if (loading || isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-6">Please log in to access this page.</p>
          <Link 
            href="/login" 
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // Regular loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!weddingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-medium text-gray-900 mb-4">Wedding Not Found</h1>
          <p className="text-gray-600 mb-6">
            We couldn't find the wedding with ID "{weddingId}". Please check the ID and try again.
          </p>
          <Link href="/" className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-medium text-gray-900">{weddingData.coupleNames}</h1>
            <p className="text-gray-600">
              Wedding Date: {weddingData.weddingDate ? new Date(weddingData.weddingDate).toLocaleDateString() : 'Not set'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link 
              href={`/wedding/${weddingId}`} 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg hover:bg-emerald-200 transition-colors"
            >
              View Wedding Site
            </Link>
            <button 
              onClick={() => setIsPaymentModalOpen(true)}
              className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
              disabled={isPremium}
            >
              {isPremium ? 'Premium Account' : 'Upgrade to Premium'}
            </button>
          </div>
        </div>
      </div>

                    {/* Unclaimed site banner */}
              {!weddingData.claimed && !user && (
                <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="text-amber-500 text-xl">⚠️</div>
                    <div>
                      <h3 className="font-medium text-amber-800 mb-1">
                        This Wedding Site Will Expire in 24 Hours!
                      </h3>
                      <p className="text-amber-700 mb-4">
                        You're viewing this site as a temporary guest. Create an account to claim this wedding site and prevent it from being deleted.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <a 
                          href={`/signup?wedding_id=${weddingId}`}
                          className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
                        >
                          Create Free Account
                        </a>
                        <a 
                          href={`/login?wedding_id=${weddingId}`}
                          className="bg-white border border-amber-600 text-amber-700 px-4 py-2 rounded-lg hover:bg-amber-50 transition-colors"
                        >
                          Sign In
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Expiration Warning or Premium Status */}
              {weddingData.claimed && (
                isPremium ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="text-emerald-500 text-xl">✨</div>
                      <div>
                        <h3 className="font-medium text-emerald-800 mb-1">
                          Premium Account
                        </h3>
                        <p className="text-emerald-700 text-sm">
                          Thank you for upgrading! Your wedding website will be available forever.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="text-amber-500 text-xl">⚠️</div>
                      <div>
                        <h3 className="font-medium text-amber-800 mb-1">
                          Free Trial Ending Soon
                        </h3>
                        <p className="text-amber-700 text-sm">
                          Your wedding website will be automatically deleted 30 days after your wedding date. 
                          <button 
                            onClick={() => setIsPaymentModalOpen(true)} 
                            className="text-amber-800 underline font-medium ml-1"
                          >
                            Upgrade to Premium
                          </button> to keep it forever.
                        </p>
                      </div>
                    </div>
                  </div>
                )
              )}

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-b-2 border-emerald-500 text-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('guests')}
            className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
              activeTab === 'guests'
                ? 'border-b-2 border-emerald-500 text-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Guest Management
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
              activeTab === 'content'
                ? 'border-b-2 border-emerald-500 text-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Content Editor
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
              activeTab === 'photos'
                ? 'border-b-2 border-emerald-500 text-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Photo Management
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-b-2 border-emerald-500 text-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Settings
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {activeTab === 'overview' && (
          <div>
            <h2 className="text-xl font-medium text-gray-900 mb-6">Dashboard Overview</h2>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">Total Guests</div>
                <div className="text-2xl font-medium text-gray-900">{stats.totalInvited}</div>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">Attending</div>
                <div className="text-2xl font-medium text-emerald-600">{stats.attending}</div>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">Not Attending</div>
                <div className="text-2xl font-medium text-red-600">{stats.notAttending}</div>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">Response Rate</div>
                <div className="text-2xl font-medium text-gray-900">
                  {Math.round(stats.responseRate)}%
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button 
                  onClick={() => setActiveTab('guests')}
                  className="bg-white border border-gray-200 rounded-lg p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium mb-1">Manage Guest List</div>
                  <div className="text-sm text-gray-500">Add or remove guests</div>
                </button>
                <button 
                  onClick={() => setActiveTab('content')}
                  className="bg-white border border-gray-200 rounded-lg p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium mb-1">Edit Content</div>
                  <div className="text-sm text-gray-500">Update your site text</div>
                </button>
                <button 
                  onClick={() => setActiveTab('photos')}
                  className="bg-white border border-gray-200 rounded-lg p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium mb-1">Manage Photos</div>
                  <div className="text-sm text-gray-500">Upload and organize images</div>
                </button>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Recent Activity</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Website created
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date().toLocaleDateString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        New RSVP from John Smith
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(Date.now() - 3600000).toLocaleDateString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'guests' && (
          <div>
            <h2 className="text-xl font-medium text-gray-900 mb-6">Guest Management</h2>
            
            {/* Guest List Table */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-gray-900">Guest List ({guests.length})</h3>
                <div className="flex gap-2">
                  <button 
                    className="bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-emerald-600 transition-colors"
                    onClick={() => setShowAddGuestModal(true)}
                  >
                    Add Guest
                  </button>
                  <label className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-200 transition-colors cursor-pointer">
                    Import
                    <input 
                      type="file" 
                      accept=".csv" 
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (evt) => {
                            try {
                              const text = evt.target?.result as string;
                              const lines = text.split('\n');
                              const newGuests = [];
                              
                              // Skip header row if it exists
                              const startIndex = lines[0].toLowerCase().includes('name') ? 1 : 0;
                              
                              for (let i = startIndex; i < lines.length; i++) {
                                const line = lines[i].trim();
                                if (line) {
                                  const [name, email] = line.split(',').map(item => item.trim());
                                  if (name) {
                                    newGuests.push({ 
                                      name, 
                                      email: email || '', 
                                      rsvp: 'pending' as const 
                                    });
                                  }
                                }
                              }
                              
                              if (newGuests.length > 0) {
                                const updatedGuests = [...guests, ...newGuests];
                                setGuests(updatedGuests);
                                localStorage.setItem(`guests_${weddingId}`, JSON.stringify(updatedGuests));
                                alert(`Successfully imported ${newGuests.length} guests.`);
                              } else {
                                alert('No valid guest entries found in the file.');
                              }
                            } catch (error) {
                              console.error('Error parsing CSV:', error);
                              alert('Error parsing CSV file. Please check the format.');
                            }
                          };
                          reader.readAsText(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RSVP Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {guests.map((guest, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {guest.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {guest.email || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={guest.rsvp}
                            onChange={(e) => {
                              // Update the RSVP status
                              const newRsvp = e.target.value as 'yes' | 'no' | 'pending';
                              const updatedGuests = [...guests];
                              updatedGuests[index].rsvp = newRsvp;
                              setGuests(updatedGuests);
                              
                              // Save to localStorage
                              localStorage.setItem(`guests_${weddingId}`, JSON.stringify(updatedGuests));
                            }}
                            className={`px-2.5 py-1 rounded text-xs font-medium ${
                              guest.rsvp === 'yes' 
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                : guest.rsvp === 'no'
                                ? 'bg-red-100 text-red-800 border-red-200'
                                : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                            } border`}
                          >
                            <option value="yes">Attending</option>
                            <option value="no">Not Attending</option>
                            <option value="pending">Pending</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button 
                            className="text-emerald-600 hover:text-emerald-800 mr-2"
                            onClick={() => setEditingGuest({
                              index,
                              name: guest.name,
                              email: guest.email || ''
                            })}
                          >
                            Edit
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-800"
                            onClick={() => {
                              if (confirm(`Are you sure you want to remove ${guest.name}?`)) {
                                                              const updatedGuests = [...guests];
                              updatedGuests.splice(index, 1);
                              setGuests(updatedGuests);
                              localStorage.setItem(`guests_${weddingId}`, JSON.stringify(updatedGuests));
                              }
                            }}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Export Options */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="font-medium text-gray-900 mb-3">Export Options</h3>
              <div className="flex gap-2">
                <button 
                  className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                  onClick={() => {
                    // Generate CSV content
                    const headers = ['Name', 'Email', 'RSVP Status'];
                    const csvContent = [
                      headers.join(','),
                      ...guests.map(guest => 
                        [
                          guest.name,
                          guest.email || '',
                          guest.rsvp === 'yes' ? 'Attending' : guest.rsvp === 'no' ? 'Not Attending' : 'Pending'
                        ].join(',')
                      )
                    ].join('\n');
                    
                    // Create download link
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.setAttribute('href', url);
                    link.setAttribute('download', `guest-list-${weddingId}.csv`);
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  Export to CSV
                </button>
                <button 
                  className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                  onClick={() => {
                    alert('Excel export feature will be available in the premium version.');
                  }}
                >
                  Export to Excel
                </button>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'content' && (
          <SiteContentEditor 
            weddingData={weddingData} 
            onSave={saveWeddingData} 
          />
        )}
        
        {activeTab === 'photos' && (
          <PhotoManager 
            weddingData={weddingData}
            weddingId={weddingId}
            onSave={saveWeddingData}
          />
        )}
        
        {activeTab === 'settings' && (
          <div>
            <h2 className="text-xl font-medium text-gray-900 mb-6">Settings</h2>
            
            {/* Privacy Settings */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Privacy Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    id="password-protect"
                    type="checkbox"
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                  <label htmlFor="password-protect" className="ml-2 block text-sm text-gray-900">
                    Password protect wedding site
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="guest-search"
                    type="checkbox"
                    defaultChecked={true}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                  <label htmlFor="guest-search" className="ml-2 block text-sm text-gray-900">
                    Enable guest search for RSVPs
                  </label>
                </div>
              </div>
            </div>
            
            {/* Upgrade Account */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Account Status</h3>
              {isPremium ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <h4 className="font-medium text-emerald-800 mb-2">Premium Account</h4>
                  <p className="text-emerald-700 text-sm">
                    Your website will be available forever. Thank you for upgrading!
                  </p>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-medium text-amber-800 mb-2">Free Trial</h4>
                  <p className="text-amber-700 text-sm mb-4">
                    Your website will expire 30 days after your wedding date.
                  </p>
                  <button 
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    Upgrade to Premium ($29)
                  </button>
                </div>
              )}
            </div>
            
            {/* Danger Zone */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="font-medium text-gray-900 mb-3 text-red-600">Danger Zone</h3>
              <button className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors">
                Delete Wedding Website
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={() => {
          setIsPremium(true);
          // Refresh wedding data
          try {
            const storedWeddings = JSON.parse(localStorage.getItem('weddings') || '{}');
            if (storedWeddings[weddingId]) {
              setWeddingData({...storedWeddings[weddingId]});
            }
          } catch (error) {
            console.error('Error updating wedding data after payment:', error);
          }
        }}
        weddingId={weddingId}
      />
      
      {/* Edit Guest Modal */}
      {editingGuest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setEditingGuest(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl"
            >
              &times;
            </button>
            
            <h2 className="text-xl font-medium text-gray-900 mb-6">Edit Guest</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editingGuest.name}
                  onChange={(e) => setEditingGuest({...editingGuest, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editingGuest.email}
                  onChange={(e) => setEditingGuest({...editingGuest, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setEditingGuest(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const updatedGuests = [...guests];
                  updatedGuests[editingGuest.index] = {
                    ...updatedGuests[editingGuest.index],
                    name: editingGuest.name,
                    email: editingGuest.email
                  };
                  setGuests(updatedGuests);
                  localStorage.setItem(`rsvps_${weddingId}`, JSON.stringify(updatedGuests));
                  setEditingGuest(null);
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Guest Modal */}
      {showAddGuestModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowAddGuestModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl"
            >
              &times;
            </button>
            
            <h2 className="text-xl font-medium text-gray-900 mb-6">Add New Guest</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Guest Name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={newGuestEmail}
                  onChange={(e) => setNewGuestEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="guest@example.com"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowAddGuestModal(false);
                  setNewGuestName('');
                  setNewGuestEmail('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newGuestName.trim()) {
                    const newGuest = {
                      name: newGuestName.trim(),
                      email: newGuestEmail.trim(),
                      rsvp: 'pending' as const
                    };
                    const updatedGuests = [...guests, newGuest];
                    setGuests(updatedGuests);
                    localStorage.setItem(`guests_${weddingId}`, JSON.stringify(updatedGuests));
                    setShowAddGuestModal(false);
                    setNewGuestName('');
                    setNewGuestEmail('');
                  }
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
              >
                Add Guest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
