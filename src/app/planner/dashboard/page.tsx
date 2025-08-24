'use client';

import { useState } from 'react';
import { PlannerLead } from '@/types/planner';
import Logo from '@/components/Logo';
import OnboardingSlides from './components/OnboardingSlides';

export default function PlannerDashboard() {
  const [showOnboarding, setShowOnboarding] = useState(() => {
    // Check if onboarding has been completed before
    if (typeof window !== 'undefined') {
      return !localStorage.getItem('onboardingCompleted');
    }
    return true;
  });
  const [leads, setLeads] = useState<PlannerLead[]>([
    {
      id: '1',
      weddingId: 'w1',
      coupleName: 'Sarah & Michael',
      email: 'sarah.michael@email.com',
      phone: '(555) 123-4567',
      weddingDate: '2024-09-15',
      estimatedBudget: 35000,
      guestCount: 150,
      location: {
        city: 'Boston',
        state: 'MA',
        country: 'USA'
      },
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedAt: new Date().toISOString(),
      plannerId: 'p1',
      alternatePlanners: []
    },
    {
      id: '2',
      weddingId: 'w2',
      coupleName: 'Emily & James',
      email: 'emily.james@email.com',
      phone: '(555) 987-6543',
      weddingDate: '2024-10-22',
      estimatedBudget: 45000,
      guestCount: 200,
      location: {
        city: 'Chicago',
        state: 'IL',
        country: 'USA'
      },
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedAt: new Date().toISOString(),
      plannerId: 'p1',
      alternatePlanners: []
    }
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {showOnboarding && (
        <OnboardingSlides onComplete={() => {
          setShowOnboarding(false);
          if (typeof window !== 'undefined') {
            localStorage.setItem('onboardingCompleted', 'true');
          }
        }} />
      )}
      
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Logo size="md" />
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowOnboarding(true)}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Help & Onboarding
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Your Leads</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Here are the couples interested in your services
            </p>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {leads.map((lead) => (
                <li key={lead.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{lead.coupleName}</h4>
                      <div className="mt-1 text-sm text-gray-500">
                        <p>Wedding Date: {new Date(lead.weddingDate).toLocaleDateString()}</p>
                        <p>Location: {lead.location.city}, {lead.location.state}</p>
                        <p>Guest Count: {lead.guestCount}</p>
                        <p>Budget: ${lead.estimatedBudget?.toLocaleString()}</p>
                        <p className="text-blue-600 font-medium">Email: {lead.email}</p>
                        <p className="text-blue-600 font-medium">Phone: {lead.phone}</p>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <button 
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        onClick={() => window.location.href = `/wedding/${lead.weddingId}`}
                      >
                        View Wedding Site
                      </button>
                      <button 
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        onClick={() => {
                          // TODO: Implement client details modal/page
                          alert(`Client Details:\nName: ${lead.coupleName}\nEmail: ${lead.email}\nPhone: ${lead.phone}\nWedding Date: ${new Date(lead.weddingDate).toLocaleDateString()}\nBudget: $${lead.estimatedBudget?.toLocaleString()}\nGuest Count: ${lead.guestCount}\nLocation: ${lead.location.city}, ${lead.location.state}`);
                        }}
                      >
                        View Client Details
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}