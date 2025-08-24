'use client';

export default function Features() {
  const features = [
    {
      icon: '📸',
      title: 'Photo Gallery',
      description: 'Upload unlimited photos and create stunning galleries that showcase your love story.',
      details: [
        'Drag & drop photo upload',
        'Automatic image optimization',
        'Multiple gallery layouts',
        'Photo captions and descriptions',
        'Mobile-optimized viewing'
      ],
      color: 'from-blue-50 to-blue-100'
    },
    {
      icon: '📋',
      title: 'RSVP Management',
      description: 'Streamline your guest list management with our intuitive RSVP system.',
      details: [
        'Easy guest list import',
        'Automatic RSVP tracking',
        'Guest messaging system',
        'Dietary restrictions tracking',
        'Plus-one management'
      ],
      color: 'from-green-50 to-green-100'
    },
    {
      icon: '📱',
      title: 'Mobile First Design',
      description: 'Every website is optimized for mobile sharing and social media.',
      details: [
        'Responsive design',
        'Fast loading times',
        'Social media sharing',
        'WhatsApp integration',
        'SMS sharing links'
      ],
      color: 'from-purple-50 to-purple-100'
    },
    {
      icon: '✍️',
      title: 'Story Editor',
      description: 'Share your love story with our beautiful, customizable text editor.',
      details: [
        'Rich text editing',
        'Multiple story sections',
        'Timeline features',
        'Photo integration',
        'Custom fonts and styles'
      ],
      color: 'from-rose-50 to-rose-100'
    },
    {
      icon: '🎨',
      title: 'Beautiful Templates',
      description: 'Choose from elegant, professionally designed templates that match your style.',
      details: [
        'Multiple design themes',
        'Custom color schemes',
        'Typography options',
        'Layout variations',
        'Seasonal themes'
      ],
      color: 'from-amber-50 to-amber-100'
    },
    {
      icon: '⚡',
      title: '5-Minute Setup',
      description: 'Get your wedding website live in just 5 minutes with our streamlined process.',
      details: [
        'Step-by-step wizard',
        'Auto-save functionality',
        'Preview mode',
        'Instant publishing',
        'No technical skills needed'
      ],
      color: 'from-indigo-50 to-indigo-100'
    },
    {
      icon: '📊',
      title: 'Analytics Dashboard',
      description: 'Track your website performance and guest engagement with detailed analytics.',
      details: [
        'Page view tracking',
        'Guest engagement metrics',
        'RSVP analytics',
        'Popular content insights',
        'Mobile vs desktop stats'
      ],
      color: 'from-emerald-50 to-emerald-100'
    },
    {
      icon: '🔗',
      title: 'Custom Domains',
      description: 'Get your own custom domain to make your wedding website truly personal.',
      details: [
        'Custom URL setup',
        'Domain forwarding',
        'SSL certificate included',
        'Professional branding',
        'Easy domain management'
      ],
      color: 'from-cyan-50 to-cyan-100'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="relative py-24 bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 container mx-auto px-6 text-center">
          <h1 className="font-playfair text-5xl md:text-6xl font-light text-white mb-6">
            Everything You Need
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            From photo galleries to RSVP management, we've built every feature you need for the perfect wedding website
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br ${feature.color} rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
              >
                <div className="flex items-start mb-6">
                  <div className="text-4xl mr-4">{feature.icon}</div>
                  <div>
                    <h3 className="font-playfair text-2xl font-light text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {feature.details.map((detail, detailIndex) => (
                    <div key={detailIndex} className="flex items-center text-gray-700">
                      <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {detail}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Comparison Section */}
          <div className="mt-24">
            <div className="text-center mb-16">
              <h2 className="font-playfair text-4xl font-light text-gray-900 mb-6">
                Why Choose Bind8?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                See how we compare to other wedding website builders
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="grid md:grid-cols-4 gap-0">
                <div className="bg-gray-50 p-6 border-r border-gray-200">
                  <h3 className="font-inter font-medium text-gray-900 mb-4">Features</h3>
                </div>
                <div className="bg-gray-50 p-6 border-r border-gray-200 text-center">
                  <h4 className="font-inter font-medium text-gray-900 mb-2">Bind8</h4>
                  <span className="text-green-600 text-sm font-medium">Recommended</span>
                </div>
                <div className="bg-gray-50 p-6 border-r border-gray-200 text-center">
                  <h4 className="font-inter font-medium text-gray-900 mb-2">Competitor A</h4>
                </div>
                <div className="bg-gray-50 p-6 text-center">
                  <h4 className="font-inter font-medium text-gray-900 mb-2">Competitor B</h4>
                </div>
              </div>

              {[
                { feature: 'Setup Time', bind8: '5 minutes', compA: '30+ minutes', compB: '1+ hours' },
                { feature: 'Photo Upload', bind8: 'Unlimited', compA: 'Limited', compB: 'Limited' },
                { feature: 'RSVP Management', bind8: 'Advanced', compA: 'Basic', compB: 'Basic' },
                { feature: 'Mobile Optimization', bind8: 'Perfect', compA: 'Good', compB: 'Fair' },
                { feature: 'Custom Domain', bind8: 'Included', compA: 'Extra Cost', compB: 'Not Available' },
                { feature: 'Customer Support', bind8: '24/7', compA: 'Email Only', compB: 'Limited Hours' }
              ].map((row, index) => (
                <div key={index} className="grid md:grid-cols-4 gap-0 border-t border-gray-200">
                  <div className="p-6 border-r border-gray-200">
                    <span className="font-inter font-medium text-gray-900">{row.feature}</span>
                  </div>
                  <div className="p-6 border-r border-gray-200 text-center">
                    <span className="text-green-600 font-medium">{row.bind8}</span>
                  </div>
                  <div className="p-6 border-r border-gray-200 text-center">
                    <span className="text-gray-600">{row.compA}</span>
                  </div>
                  <div className="p-6 text-center">
                    <span className="text-gray-600">{row.compB}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-20 text-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
              <h2 className="font-playfair text-4xl font-light mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Create your beautiful wedding website today and see all these features in action
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-gray-900 px-8 py-4 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                  Start Creating
                </button>
                <button className="border border-white text-white px-8 py-4 rounded-lg font-medium hover:bg-white/10 transition-colors">
                  View Examples
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
