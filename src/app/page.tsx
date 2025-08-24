'use client';
import { useEffect, useState } from 'react';
import Logo from '@/components/Logo';
import Carousel from '@/components/Carousel';
import LoginButton from '@/components/LoginButton';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header with Login */}
      <header className="absolute top-0 left-0 w-full z-20 py-4">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center">
            <Logo size="sm" className="text-white" />
            <div className="flex items-center gap-4">
              <a href="/features" className="text-white hover:text-emerald-100 transition-colors">Features</a>
              <a href="/examples" className="text-white hover:text-emerald-100 transition-colors">Examples</a>
              <a href="/pricing" className="text-white hover:text-emerald-100 transition-colors">Pricing</a>
              {/* Import and use the LoginButton component */}
              {isLoaded && <div className="opacity-100 transition-opacity duration-1000 delay-1200">
                <LoginButton />
              </div>}
            </div>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0">
          <img 
            src="/images/hero-bg.jpeg" 
            alt="Beautiful wedding couple"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
        
        <div className={`relative z-10 text-center max-w-4xl mx-auto px-6 transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>

          <h1 className={`font-playfair text-5xl md:text-7xl font-light mb-8 tracking-tight text-white transform transition-all duration-1000 delay-300 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            Your Love Story, Beautifully Told
        </h1>
          
          <p className={`font-cormorant text-xl md:text-2xl text-white/90 mb-8 font-light transform transition-all duration-1000 delay-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            In 5 minutes. No coding required.
          </p>
          
          <p className={`text-lg text-white/80 max-w-2xl mx-auto leading-relaxed mb-12 transform transition-all duration-1000 delay-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            Upload 4 photos, add your guest list, and have a beautiful wedding website ready to share with your loved ones.
          </p>

                                <div className={`flex flex-col sm:flex-row gap-4 justify-center transform transition-all duration-1000 delay-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <a href="/create" className="bg-white text-gray-900 px-8 py-4 rounded-lg font-medium hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-lg inline-block">
                          Start Creating
                        </a>
                        <a href="/examples" className="border border-white text-white px-8 py-4 rounded-lg font-medium hover:bg-white/10 transition-all duration-300 hover:scale-105 inline-block">
                          See Examples
                        </a>
          </div>
        </div>
      </section>

      {/* Features Section - Simplified & Elegant */}
      <section className="py-32 bg-gradient-to-br from-emerald-50 to-blue-50">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="font-playfair text-5xl md:text-6xl font-light text-gray-900 mb-8 animate-fade-in-up">
                Everything You Need
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-up delay-300">
                Beautiful, simple, and complete - everything for your perfect wedding website
              </p>
        </div>
        
            {/* Simple feature cards */}
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 - Photo Gallery */}
              <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-500 animate-fade-in-up delay-500 group">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">📸</span>
                  </div>
                  <h3 className="font-playfair text-2xl font-light text-gray-900 mb-3">Photo Gallery</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Upload your best photos and create beautiful galleries that your guests will love.
                  </p>
                </div>
              </div>

              {/* Feature 2 - RSVP Management */}
              <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-500 animate-fade-in-up delay-700 group">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">📋</span>
                  </div>
                  <h3 className="font-playfair text-2xl font-light text-gray-900 mb-3">RSVP Management</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Easy guest list management with automatic tracking and beautiful RSVP forms.
                  </p>
                </div>
              </div>

              {/* Feature 3 - Mobile First */}
              <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-500 animate-fade-in-up delay-900 group">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">📱</span>
                  </div>
                  <h3 className="font-playfair text-2xl font-light text-gray-900 mb-3">Mobile First</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Perfect for sharing on social media and messaging apps. Your guests will love it.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA to features page */}
            <div className="text-center mt-12 animate-fade-in-up delay-1100">
              <a 
                href="/features" 
                className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium transition-colors group"
              >
                <span>See all features</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-32 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="font-playfair text-5xl md:text-6xl font-light text-gray-900 mb-8 animate-fade-in-up">
                How It Works
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-up delay-300">
                Three simple steps to your perfect wedding website
              </p>
            </div>
            
                              {/* Carousel for desktop */}
                  <div className="hidden md:block">
                    <Carousel autoPlayInterval={6000} className="max-w-4xl mx-auto">
                      {/* Step 1 */}
                      <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 animate-fade-in-up delay-500">
                        <div className="grid grid-cols-2 gap-0 h-96">
                          <div className="relative h-full">
                            <img
                              src="/images/bride1.jpeg"
                              alt="Beautiful bride"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
                          </div>
                          <div className="p-12 flex flex-col justify-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center mb-6">
                              <span className="text-white text-2xl font-bold">1</span>
                            </div>
                            <h3 className="font-playfair text-3xl font-light text-gray-900 mb-4">Upload Photos</h3>
                            <p className="text-gray-600 text-lg leading-relaxed">Simply drag and drop your 4 best wedding photos. We'll handle the rest with our intelligent optimization.</p>
                          </div>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 animate-fade-in-up delay-700">
                        <div className="grid grid-cols-2 gap-0 h-96">
                          <div className="p-12 flex flex-col justify-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-6">
                              <span className="text-white text-2xl font-bold">2</span>
                            </div>
                            <h3 className="font-playfair text-3xl font-light text-gray-900 mb-4">Add Details</h3>
                            <p className="text-gray-600 text-lg leading-relaxed">Enter your story, venue details, and guest list. Everything is customizable to match your style.</p>
                          </div>
                          <div className="relative h-full">
                            <img
                              src="/images/honeymoon.jpeg"
                              alt="Honeymoon couple"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-l from-black/20 to-transparent" />
                          </div>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 animate-fade-in-up delay-900">
                        <div className="grid grid-cols-2 gap-0 h-96">
                          <div className="relative h-full">
                            <img
                              src="/images/dance.jpeg"
                              alt="Wedding dance"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
                          </div>
                          <div className="p-12 flex flex-col justify-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-6">
                              <span className="text-white text-2xl font-bold">3</span>
                            </div>
                            <h3 className="font-playfair text-3xl font-light text-gray-900 mb-4">Share & Celebrate</h3>
                            <p className="text-gray-600 text-lg leading-relaxed">Get your unique URL and share it with family and friends instantly. Start celebrating your love story.</p>
                          </div>
                        </div>
                      </div>
                    </Carousel>
                  </div>

                  {/* Vertical layout for mobile */}
                  <div className="md:hidden space-y-8">
                    {/* Step 1 */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 animate-fade-in-up delay-500">
                      <div className="grid grid-cols-1 gap-0">
                        <div className="relative h-64">
                          <img
                            src="/images/bride1.jpeg"
                            alt="Beautiful bride"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
                        </div>
                        <div className="p-8 flex flex-col justify-center">
                          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center mb-6">
                            <span className="text-white text-2xl font-bold">1</span>
                          </div>
                          <h3 className="font-playfair text-2xl font-light text-gray-900 mb-4">Upload Photos</h3>
                          <p className="text-gray-600 text-base leading-relaxed">Simply drag and drop your 4 best wedding photos. We'll handle the rest with our intelligent optimization.</p>
                        </div>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 animate-fade-in-up delay-700">
                      <div className="grid grid-cols-1 gap-0">
                        <div className="p-8 flex flex-col justify-center">
                          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-6">
                            <span className="text-white text-2xl font-bold">2</span>
                          </div>
                          <h3 className="font-playfair text-2xl font-light text-gray-900 mb-4">Add Details</h3>
                          <p className="text-gray-600 text-base leading-relaxed">Enter your story, venue details, and guest list. Everything is customizable to match your style.</p>
                        </div>
                        <div className="relative h-64">
                          <img
                            src="/images/honeymoon.jpeg"
                            alt="Honeymoon couple"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-l from-black/20 to-transparent" />
                        </div>
                      </div>
              </div>
              
                    {/* Step 3 */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 animate-fade-in-up delay-900">
                      <div className="grid grid-cols-1 gap-0">
                        <div className="relative h-64">
                          <img
                            src="/images/dance.jpeg"
                            alt="Wedding dance"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
                        </div>
                        <div className="p-8 flex flex-col justify-center">
                          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-6">
                            <span className="text-white text-2xl font-bold">3</span>
                          </div>
                          <h3 className="font-playfair text-2xl font-light text-gray-900 mb-4">Share & Celebrate</h3>
                          <p className="text-gray-600 text-base leading-relaxed">Get your unique URL and share it with family and friends instantly. Start celebrating your love story.</p>
                        </div>
                      </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-playfair text-5xl md:text-6xl font-light text-white mb-8 animate-fade-in-up">
              Ready to Create Your Wedding Website?
            </h2>
            
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-300">
              Join thousands of couples who have created beautiful wedding websites in minutes. 
              No technical skills required.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-500">
              <a href="/create" className="bg-white text-gray-900 px-8 py-4 rounded-lg font-medium hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-lg inline-block">
                Start Creating Now
              </a>
              <a href="/pricing" className="border border-white text-white px-8 py-4 rounded-lg font-medium hover:bg-white/10 transition-all duration-300 hover:scale-105 inline-block">
                View Pricing
              </a>
            </div>
            
            <p className="text-sm text-gray-400 mt-8 animate-fade-in-up delay-700">
              Free to start • No credit card required • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800">
        <div className="container mx-auto px-6 py-20">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="mb-4">
                <Logo size="md" className="text-white" />
              </div>
              <p className="text-gray-400">
                Create beautiful wedding websites in minutes.
              </p>
            </div>
            
            <div>
              <h4 className="font-inter font-medium text-white mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="/pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="/examples" className="hover:text-white transition-colors">Examples</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-inter font-medium text-white mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-inter font-medium text-white mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-400">
                © 2024 Bind8. All rights reserved.
              </p>
              
              {/* Made with Bind8 */}
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <span>Made with</span>
                <a 
                  href="https://bind8.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white hover:text-blue-400 transition-colors duration-300"
                >
                  Bind8
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
      </div>
  );
}