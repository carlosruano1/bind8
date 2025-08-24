'use client';

export default function Examples() {
  const examples = [
    {
      name: 'Sarah & Michael',
      date: 'December 15, 2024',
      location: 'Napa Valley, CA',
      image: '/images/hero-bg.jpeg',
      description: 'A romantic vineyard wedding with elegant touches',
      features: ['Photo Gallery', 'RSVP Management', 'Guest Stories'],
      color: 'from-rose-50 to-pink-100'
    },
    {
      name: 'Emma & James',
      date: 'March 22, 2024',
      location: 'Maui, Hawaii',
      image: '/images/couple.jpeg',
      description: 'Beachfront celebration with tropical vibes',
      features: ['Photo Gallery', 'Travel Info', 'Local Activities'],
      color: 'from-blue-50 to-cyan-100'
    },
    {
      name: 'Isabella & David',
      date: 'June 8, 2024',
      location: 'New York City',
      image: '/images/venue.jpeg',
      description: 'Urban sophistication meets timeless romance',
      features: ['Photo Gallery', 'RSVP Management', 'City Guide'],
      color: 'from-purple-50 to-indigo-100'
    },
    {
      name: 'Sophia & Alexander',
      date: 'September 14, 2024',
      location: 'Tuscany, Italy',
      image: '/images/hero-bg.jpeg',
      description: 'Italian countryside charm and rustic elegance',
      features: ['Photo Gallery', 'Travel Planning', 'Local Vendors'],
      color: 'from-amber-50 to-orange-100'
    },
    {
      name: 'Olivia & William',
      date: 'May 18, 2024',
      location: 'Aspen, Colorado',
      image: '/images/couple.jpeg',
      description: 'Mountain wedding with breathtaking views',
      features: ['Photo Gallery', 'RSVP Management', 'Accommodation'],
      color: 'from-green-50 to-emerald-100'
    },
    {
      name: 'Ava & Benjamin',
      date: 'October 5, 2024',
      location: 'Charleston, SC',
      image: '/images/venue.jpeg',
      description: 'Southern charm and historic elegance',
      features: ['Photo Gallery', 'RSVP Management', 'Local History'],
      color: 'from-red-50 to-rose-100'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="relative py-24 bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 container mx-auto px-6 text-center">
          <h1 className="font-playfair text-5xl md:text-6xl font-light text-white mb-6">
            Real Wedding Websites
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            See how couples are using Bind8 to create beautiful, personalized wedding websites
          </p>
        </div>
      </div>

      {/* Examples Grid */}
      <div className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {examples.map((example, index) => (
              <div
                key={index}
                className={`group bg-gradient-to-br ${example.color} rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2`}
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={example.image}
                    alt={`${example.name} wedding`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  
                  {/* Preview Badge */}
                  <div className="absolute top-4 right-4">
                    <span className="bg-white/90 text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
                      Live Preview
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-playfair text-2xl font-light text-gray-900 mb-2">
                    {example.name}
                  </h3>
                  
                  <div className="flex items-center text-gray-600 text-sm mb-3">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    {example.date}
                  </div>
                  
                  <div className="flex items-center text-gray-600 text-sm mb-4">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {example.location}
                  </div>

                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {example.description}
                  </p>

                  {/* Features */}
                  <div className="mb-6">
                    <h4 className="font-inter font-medium text-gray-900 mb-3">Features Used:</h4>
                    <div className="flex flex-wrap gap-2">
                      {example.features.map((feature, featureIndex) => (
                        <span
                          key={featureIndex}
                          className="bg-white/70 text-gray-700 px-3 py-1 rounded-full text-sm"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex gap-3">
                    <button className="flex-1 bg-gray-900 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                      View Website
                    </button>
                    <button className="bg-white/70 text-gray-900 py-2 px-4 rounded-lg font-medium hover:bg-white transition-colors">
                      Use Template
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-20 text-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
              <h2 className="font-playfair text-4xl font-light mb-6">
                Ready to Create Your Own?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Join thousands of couples who have created beautiful wedding websites in just 5 minutes
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/create"
                  className="bg-white text-gray-900 px-8 py-4 rounded-lg font-medium hover:bg-gray-100 transition-colors text-center"
                >
                  Start Creating
                </a>
                <button className="border border-white text-white px-8 py-4 rounded-lg font-medium hover:bg-white/10 transition-colors">
                  View All Templates
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
