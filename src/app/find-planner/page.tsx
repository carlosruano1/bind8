'use client';

import { useState } from 'react';
import { WeddingPlanner, PlannerSpecialty, PlannerStyle } from '@/types/planner';

export default function FindPlanner() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState<PlannerSpecialty[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<PlannerStyle[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [location, setLocation] = useState('');
  const [planners, setPlanners] = useState<WeddingPlanner[]>([]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              Find Your Perfect Wedding Planner
            </h1>
            <p className="mt-4 max-w-xl mx-auto text-xl text-gray-500">
              Browse our curated list of professional wedding planners and find the perfect match for your special day.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden my-8">
          <div className="p-6">
            {/* Search Bar */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by name, location, or specialty..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Search
              </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Specialties */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialties
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  multiple
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value as PlannerSpecialty);
                    setSelectedSpecialties(values);
                  }}
                >
                  <option value="full-service">Full Service Planning</option>
                  <option value="day-of">Day-of Coordination</option>
                  <option value="destination">Destination Weddings</option>
                  <option value="cultural-religious">Cultural/Religious Weddings</option>
                  <option value="lgbtq">LGBTQ+ Weddings</option>
                  <option value="micro-wedding">Micro Weddings</option>
                  <option value="luxury">Luxury Weddings</option>
                  <option value="eco-friendly">Eco-Friendly Weddings</option>
                </select>
              </div>

              {/* Styles */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Styles
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  multiple
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value as PlannerStyle);
                    setSelectedStyles(values);
                  }}
                >
                  <option value="modern">Modern</option>
                  <option value="traditional">Traditional</option>
                  <option value="bohemian">Bohemian</option>
                  <option value="minimalist">Minimalist</option>
                  <option value="luxury">Luxury</option>
                  <option value="rustic">Rustic</option>
                  <option value="vintage">Vintage</option>
                  <option value="contemporary">Contemporary</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="Enter city or zip code"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Planner Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {planners.map((planner) => (
            <div key={planner.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Planner Image */}
              {planner.portfolio.images[0] && (
                <div className="h-48 w-full overflow-hidden">
                  <img
                    src={planner.portfolio.images[0]}
                    alt={`${planner.name}'s portfolio`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Planner Info */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{planner.name}</h3>
                  <div className="flex items-center">
                    <span className="text-yellow-400">★</span>
                    <span className="ml-1 text-gray-600">{planner.rating}</span>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{planner.company}</p>

                {/* Location */}
                <div className="flex items-center text-gray-500 mb-4">
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{planner.location.city}, {planner.location.state}</span>
                </div>

                {/* Specialties */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {planner.specialties.slice(0, 3).map((specialty) => (
                    <span
                      key={specialty}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {specialty.replace('-', ' ')}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Contact
                  </button>
                  <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
