'use client';

import { useState } from 'react';

const slides = [
  {
    title: "Welcome to Bind8",
    content: "We're excited to help you grow your wedding planning business. Here are some quick tips to make the most of your leads.",
  },
  {
    title: "Quick Response Matters",
    content: "Respond to leads within 24 hours. First impressions count, and quick responses show professionalism and enthusiasm.",
  },
  {
    title: "Be Personal & Professional",
    content: "Address couples by name, reference specific details about their wedding, and show genuine interest in their vision.",
  },
  {
    title: "Set Clear Expectations",
    content: "Be transparent about your services, pricing, and availability. Clear communication builds trust from the start.",
  },
  {
    title: "Follow Up Thoughtfully",
    content: "If you don't hear back, follow up once or twice with valuable information or insights. Don't be pushy.",
  }
];

export default function OnboardingSlides({ onComplete }: { onComplete: () => void }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide === slides.length - 1) {
      onComplete();
    } else {
      setCurrentSlide(currentSlide + 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-lg w-full mx-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {slides[currentSlide].title}
          </h2>
          <p className="text-gray-600">
            {slides[currentSlide].content}
          </p>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full ${
                  index === currentSlide ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <button
            onClick={nextSlide}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
