'use client';
import { useState } from 'react';

export default function Pricing() {
  const [showPlannerPricing, setShowPlannerPricing] = useState(false);

  const consumerPlans = [
    {
      name: 'Basic',
      price: 49.99,
      period: 'one-time',
      oldPrice: 99.99,
      description: 'Everything you need to plan your perfect day',
      saveAmount: '50%',
      features: [
        'Beautiful Wedding Website',
        'Guest List Management',
        'Digital Invitations',
        'RSVP Tracking',
        'Wedding Timeline',
        'Budget Calculator',
        'Vendor Recommendations',
        'Mobile Responsive'
      ],
      popular: false,
      color: 'from-rose-50 to-rose-100'
    },
    {
      name: 'Premium',
      price: 69.99,
      period: 'one-time',
      oldPrice: 149.99,
      description: 'The ultimate wedding planning experience',
      saveAmount: '53%',
      limitedOffer: 'Only 3 spots left at this price!',
      features: [
        'Everything in Basic, plus:',
        'Premium Website Themes',
        'Custom Domain Name',
        'Photo Gallery & Sharing',
        'Honeymoon Registry',
        'Seating Arrangement Tool',
        'Vendor Communication Hub',
        'Priority Support',
        'Wedding Day Timeline App'
      ],
      popular: true,
      color: 'from-blue-50 to-blue-100'
    }
  ];

  const plannerPlans = [
    {
      name: 'Lead Generation',
      price: 199.99,
      period: 'month',
      oldPrice: 399.99,
      earlyAccess: true,
      description: 'Get matched with couples in your area',
      features: [
        'Unlimited Lead Access',
        'Featured Business Profile',
        'Lead Management Dashboard',
        'Real-time Notifications',
        'Performance Analytics',
        'Export to Popular CRMs',
        'Priority Listing in Search',
        'Cancel Anytime'
      ],
      popular: true,
      color: 'from-purple-50 to-purple-100',
      limitedOffer: 'Early Access Pricing - Lock in this rate forever!'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="relative py-24 bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 container mx-auto px-6 text-center">
          <h1 className="font-playfair text-5xl md:text-6xl font-light text-white mb-6">
            Plan Your Perfect Wedding
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Create your dream wedding website, manage your guest list, and stay organized throughout your planning journey.
          </p>
          <button
            onClick={() => setShowPlannerPricing(!showPlannerPricing)}
            className="mt-8 text-sm text-white/60 hover:text-white/90 underline transition-colors"
          >
            {showPlannerPricing ? "Looking to plan your wedding?" : "Are you a wedding planner?"}
          </button>
        </div>
      </div>

      {/* Value Proposition */}
      <div className="py-12">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="flex flex-col items-center">
              <span className="text-sm bg-green-100 text-green-700 px-4 py-1 rounded-full mb-4">
                ⚡ Limited Time Launch Offer - Save up to 53%
              </span>
              <h2 className="text-2xl font-medium text-gray-900 mb-4">
                {showPlannerPricing ? "Grow Your Wedding Planning Business" : "Everything You Need to Plan Your Wedding"}
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto mb-4">
                {showPlannerPricing 
                  ? "Connect with engaged couples in your area and grow your business with our lead generation platform." 
                  : "Join 10,000+ happy couples who planned their perfect wedding with us. One-time payment, lifetime access."}
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  30-day guarantee
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  5-minute setup
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  No credit card needed
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className={`grid ${showPlannerPricing ? 'md:grid-cols-1 max-w-xl' : 'md:grid-cols-2 max-w-4xl'} gap-8 mx-auto`}>
            {(showPlannerPricing ? plannerPlans : consumerPlans).map((plan, index) => (
              <div
                key={plan.name}
                className={`relative bg-gradient-to-br ${plan.color} rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 ${
                  plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="font-playfair text-3xl font-light text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  
                  <div className="mb-6">
                    {plan.oldPrice && (
                      <div className="mb-2">
                        <span className="text-lg text-gray-500 line-through">${plan.oldPrice}</span>
                        <span className="ml-2 text-sm bg-red-100 text-red-600 px-2 py-1 rounded-full">50% OFF</span>
                      </div>
                    )}
                    {plan.earlyAccess && (
                      <div className="mb-3">
                        <span className="text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full">
                          Early Access Program
                        </span>
                        <p className="text-sm text-blue-600 mt-1">Contact us for special launch offers</p>
                      </div>
                    )}
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                      <span className="text-gray-600 ml-1">{plan.period === 'one-time' ? ' once' : `/${plan.period}`}</span>
                    </div>
                    {plan.limitedOffer && (
                      <div className="mt-2 text-sm text-orange-600 font-medium animate-pulse">
                        {plan.limitedOffer}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <a
                      href={showPlannerPricing ? '/planner/signup' : '/signup'}
                      className={`block w-full py-3 px-6 rounded-lg font-medium transition-all transform hover:scale-105 text-center ${
                        plan.popular
                          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                          : 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      Get Started Now
                    </a>
                    <p className="text-xs text-gray-500 text-center">
                      30-day money-back guarantee
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-inter font-medium text-gray-900 mb-4">What's included:</h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-24 text-center">
            <h2 className="font-playfair text-4xl font-light text-gray-900 mb-12">
              Frequently Asked Questions
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {showPlannerPricing ? (
                <>
                  <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-left">
                    <h3 className="font-inter font-medium text-gray-900 mb-3">How does lead generation work?</h3>
                    <p className="text-gray-600">We match you with engaged couples in your area based on their preferences and your expertise. You'll receive notifications when new leads are available.</p>
                  </div>
                  
                  <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-left">
                    <h3 className="font-inter font-medium text-gray-900 mb-3">Can I cancel my subscription?</h3>
                    <p className="text-gray-600">Yes, you can cancel anytime. Your subscription will remain active until the end of your current billing period.</p>
                  </div>
                  
                  <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-left">
                    <h3 className="font-inter font-medium text-gray-900 mb-3">How are leads qualified?</h3>
                    <p className="text-gray-600">We verify each couple's wedding date, budget, and planning needs to ensure you receive quality leads that match your services.</p>
                  </div>
                  
                  <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-left">
                    <h3 className="font-inter font-medium text-gray-900 mb-3">What areas do you cover?</h3>
                    <p className="text-gray-600">We operate across the United States. You can specify your service area and we'll only send you leads from those locations.</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-left">
                    <h3 className="font-inter font-medium text-gray-900 mb-3">Can I upgrade my plan later?</h3>
                    <p className="text-gray-600">Yes! You can upgrade to Premium anytime by paying the difference. All your data and settings will be preserved.</p>
                  </div>
                  
                  <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-left">
                    <h3 className="font-inter font-medium text-gray-900 mb-3">How long can I access my wedding website?</h3>
                    <p className="text-gray-600">Your website stays active for 1 year after your wedding date. You can download all your data and photos anytime.</p>
                  </div>
                  
                  <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-left">
                    <h3 className="font-inter font-medium text-gray-900 mb-3">Is this really a one-time payment?</h3>
                    <p className="text-gray-600">Yes! Pay once and get access to all features until after your wedding. No hidden fees or subscriptions.</p>
                  </div>
                  
                  <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-left">
                    <h3 className="font-inter font-medium text-gray-900 mb-3">What support do you offer?</h3>
                    <p className="text-gray-600">All plans include email support. Premium plan users get priority support for faster response times.</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
