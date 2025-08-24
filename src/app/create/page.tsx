'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/Logo';
import * as ExcelJS from 'exceljs';
import { uploadImage, uploadMultipleImages } from '@/lib/supabaseClient';
import React from 'react'; // Added for useEffect

// File processing function
const processGuestListFile = (file: File): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        if (file.name.endsWith('.csv')) {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim());
          
          // Remove header row if it exists
          const dataLines = lines.slice(1);
          
          // Extract guest names (assuming first column is names)
          const guests = dataLines
            .map(line => {
              const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));
              return columns[0]; // First column is the name
            })
            .filter(name => name && name.length > 0);
          
          resolve(guests);
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          // Proper Excel file parsing using ExcelJS
          const workbook = new ExcelJS.Workbook();
          const buffer = e.target?.result as ArrayBuffer;
          
          try {
            await workbook.xlsx.load(buffer);
            
            // Try to get the "Guest List" sheet first, then fall back to the second sheet
            let worksheet = workbook.getWorksheet('Guest List');
            if (!worksheet) {
              // If "Guest List" sheet doesn't exist, get the second sheet (index 1)
              const sheetNames = workbook.worksheets.map(ws => ws.name);
              if (sheetNames.length >= 2) {
                worksheet = workbook.getWorksheet(sheetNames[1]); // Second sheet
              } else {
                worksheet = workbook.getWorksheet(sheetNames[0]); // Fall back to first sheet
              }
            }
            
            if (!worksheet) {
              reject(new Error('No valid worksheet found in the Excel file'));
              return;
            }
            
            // Extract guest names from first column, skipping header row
            const guests: string[] = [];
            worksheet.eachRow((row, rowNumber) => {
              if (rowNumber > 1) { // Skip header row
                const firstCell = row.getCell(1);
                if (firstCell && firstCell.value) {
                  const name = String(firstCell.value).trim();
                  if (name && name.length > 0 && name !== 'Name') {
                    guests.push(name);
                  }
                }
              }
            });
            
            resolve(guests);
          } catch (error) {
            reject(new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`));
          }
        } else {
          reject(new Error('Unsupported file format. Please use CSV or Excel files.'));
        }
      } catch (error) {
        console.error('File processing error:', error);
        reject(new Error(`Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    
    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      // Read Excel files as ArrayBuffer for proper parsing
      reader.readAsArrayBuffer(file);
    } else {
      reject(new Error('Unsupported file format'));
    }
  });
};

// Couple-specific prompts categorized by type
const COUPLE_PROMPTS = {
  "First Moments": [
    "The day we first met...",
    "Our first date was...",
    "The moment I knew they were the one...",
    "The moment we realized we were meant to be...",
    "The moment we decided to get married..."
  ],
  "Adventures & Travel": [
    "Our biggest adventure together...",
    "Our favorite travel memory...",
    "The time we got lost together...",
    "The time we [insert adventure]..."
  ],
  "Funny Stories": [
    "The funniest thing that happened to us...",
    "Our most embarrassing moment as a couple...",
    "Our biggest cooking disaster...",
    "The time we [insert funny story]...",
    "Our favorite inside joke..."
  ],
  "Daily Life": [
    "The day we moved in together...",
    "Our favorite lazy Sunday together...",
    "Our favorite date night tradition...",
    "The day we adopted our pet..."
  ],
  "Challenges & Growth": [
    "The time we survived [insert challenge]...",
    "Our most romantic moment..."
  ]
};

interface PromptResponse {
  prompt: string;
  response: string;
  response2?: string; // For separate him/her responses
  photo: File | null;
  photoPreview: string | null;
  answeredBy?: 'both' | 'him' | 'her';
}

interface SavedPromptResponse {
  prompt: string;
  response: string;
  response2?: string;
  photo?: string | null;
  photoPreview?: string | null;
  answeredBy?: 'both' | 'him' | 'her';
}

interface WeddingData {
  id: string;
  createdAt: string;
  coupleNames: string;
  weddingDate: string;
  venue: string;
  venueAddress: string;
  venueCity: string;
  venueState: string;
  venueZip: string;
  ceremonyTime: string;
  receptionTime: string;
  dressCode: string;
  theme: string;
  colorScheme: string;
  howWeMet: string;
  promptResponses: SavedPromptResponse[];
  registryLinks: string[];
  accommodationInfo: string;
  transportationInfo: string;
  specialInstructions: string;
  rsvpDeadline: string;
  guestList: string[];
  heroPhoto?: string | null;
  couplePhoto?: string | null;
  photos: string[];
  expiresAt?: string;
  claimed?: boolean;
  email?: string;
  userId?: string;
  isPremium?: boolean;
}

interface CreateStep {
  id: number;
  title: string;
  description: string;
  component: React.ReactNode;
}

export default function CreatePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFloatingProgress, setShowFloatingProgress] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { user, loading, checkAuth } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // Check if user is authenticated, but don't require it
    const checkUserAuth = async () => {
      await checkAuth();
      setIsCheckingAuth(false);
    };
    
    checkUserAuth();
  }, [checkAuth]);
  
  const [formData, setFormData] = useState({
    // Basic Information
    coupleNames: '',
    weddingDate: '',
    venue: '',
    venueAddress: '',
    venueCity: '',
    venueState: '',
    venueZip: '',
    
    // Enhanced Details
    ceremonyTime: '',
    receptionTime: '',
    dressCode: '',
    theme: '',
    colorScheme: '',
    
    // Story & Content (Legacy - keeping for backward compatibility)
    story: '',
    howWeMet: '',
    proposal: '',
    favoriteThings: '',
    
    // New Hinge-style Prompts
    promptResponses: [] as PromptResponse[],
    
    // Visual Elements
    photos: [] as File[],
    heroPhoto: null as File | null,
    couplePhoto: null as File | null,
    venuePhoto: null as File | null,
    
    // Guest Management
    guestList: [] as string[],
    rsvpDeadline: '',
    
    // Additional Features
    registryLinks: [] as string[],
    accommodationInfo: '',
    transportationInfo: '',
    specialInstructions: '',
    
    // Design Preferences
    designStyle: 'modern',
    includeCountdown: true,
    includePhotoGallery: true,
    includeGuestBook: true,
    includeRSVP: true
  });

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle scroll for floating progress indicator
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowFloatingProgress(scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleFileUpload = async (file: File) => {
    try {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      const guests = await processGuestListFile(file);
      
      if (guests.length === 0) {
        alert('No valid guest names found in the file. Please check the format.');
        return;
      }

      // Add new guests to existing list (avoiding duplicates)
      const existingGuests = new Set(formData.guestList);
      const newGuests = guests.filter(guest => !existingGuests.has(guest));
      
      if (newGuests.length === 0) {
        alert('All guests from the file are already in your list.');
        return;
      }

      updateFormData('guestList', [...formData.guestList, ...newGuests]);
      alert(`Successfully imported ${newGuests.length} guests!`);
      
    } catch (error) {
      alert(`Error processing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const steps: CreateStep[] = [
    {
      id: 1,
      title: "Welcome to Your Dream Wedding Website",
      description: "Let's create something absolutely magical",
      component: (
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-emerald-50 to-blue-50 border border-emerald-200 rounded-xl p-8">
            <h3 className="font-playfair text-2xl font-light text-emerald-900 mb-4">✨ Create Your Perfect Wedding Website</h3>
            <p className="text-emerald-700 mb-6 text-lg">
              We're going to create a wedding website so beautiful, your guests will be talking about it for years to come.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 border border-emerald-200">
                <h4 className="font-semibold text-emerald-900 mb-3">🎨 What You'll Get</h4>
                <ul className="space-y-2 text-emerald-700">
                  <li>• Stunning, mobile-responsive design</li>
                  <li>• Professional photo galleries</li>
                  <li>• Interactive RSVP system</li>
                  <li>• Beautiful love story presentation</li>
                  <li>• Guest book and countdown timer</li>
                  <li>• Custom domain (Premium)</li>
            </ul>
              </div>
              <div className="bg-white rounded-lg p-6 border border-emerald-200">
                <h4 className="font-semibold text-emerald-900 mb-3">📋 What You'll Need</h4>
                <ul className="space-y-2 text-emerald-700">
                  <li>• 3-4 of your best photos</li>
                  <li>• Your love story</li>
                  <li>• Wedding details</li>
                  <li>• Guest list (optional)</li>
                  <li>• 5 minutes of your time</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <h3 className="font-playfair text-xl font-light text-amber-900 mb-4">💎 Premium Features Available</h3>
            <p className="text-amber-700 mb-4">
              <strong>Free websites are automatically deleted 30 days after your wedding date.</strong>
            </p>
            <div className="bg-white rounded-lg p-4 border border-amber-300">
              <p className="text-amber-800 text-sm">
              🚀 <strong>Upgrade to Premium for just $29</strong> and get:
              <br />• Permanent website (never expires)
              <br />• Custom domain (yourname.com)
              <br />• Advanced analytics
              <br />• Priority support
              <br />• Unlimited photo uploads
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-gray-600 mb-4 text-lg">Ready to create something extraordinary?</p>
            <div className="text-sm text-gray-500">
              <p>✨ No credit card required • Cancel anytime • Beautiful results guaranteed</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "Your Love Story",
      description: "Share your story through fun prompts (like Hinge!)",
      component: (
        <div className="space-y-8">
          {/* Couple Names */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couple Names *
            </label>
            <input
              type="text"
              value={formData.coupleNames}
              onChange={(e) => updateFormData('coupleNames', e.target.value)}
              placeholder="e.g., Sarah & Michael"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Simple Prompt System */}
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-medium text-blue-900 mb-2">💕 Tell Your Love Story</h3>
              <p className="text-blue-700 text-sm">
                Choose up to 3 prompts to share your favorite moments together. Each prompt can include a photo!
              </p>
              
              {/* Progress Indicator */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                    {formData.promptResponses.length}/3
                  </div>
                  <span className="text-emerald-700 font-medium">
                    {formData.promptResponses.length === 0 && "No prompts selected yet"}
                    {formData.promptResponses.length === 1 && "1 prompt selected"}
                    {formData.promptResponses.length === 2 && "2 prompts selected"}
                    {formData.promptResponses.length === 3 && "All 3 prompts selected!"}
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="flex-1 max-w-xs ml-4">
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-500 ease-out shadow-sm"
                      style={{ width: `${(formData.promptResponses.length / 3) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* All Prompts Display */}
            <div className="space-y-4">
              {Object.entries(COUPLE_PROMPTS).map(([category, prompts]) => (
                <div key={category} className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="font-medium text-gray-900 mb-4 capitalize">
                    {category.replace(/([A-Z])/g, ' $1').trim()}
                  </h4>
                  <div className="grid gap-4">
                    {prompts.map((prompt) => {
                      const existingResponse = formData.promptResponses.find(pr => pr.prompt === prompt);
                      const isSelected = !!existingResponse;
                      const promptIndex = existingResponse ? formData.promptResponses.findIndex(pr => pr.prompt === prompt) + 1 : null;
                      
                      return (
                        <div key={prompt} className={`border-2 rounded-lg p-4 transition-all ${
                          isSelected 
                            ? 'border-emerald-500 bg-emerald-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}>
                          {/* Prompt Header */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <h5 className="font-medium text-gray-900">{prompt}</h5>
                              {isSelected && promptIndex && (
                                <div className="bg-emerald-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                  #{promptIndex}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {isSelected ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateFormData('promptResponses', 
                                      formData.promptResponses.filter(pr => pr.prompt !== prompt)
                                    );
                                  }}
                                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                                >
                                  Remove
                                </button>
                              ) : formData.promptResponses.length < 3 ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateFormData('promptResponses', [
                                      ...formData.promptResponses,
                                      { prompt, response: '', photo: null, photoPreview: null, answeredBy: 'both' }
                                    ]);
                                  }}
                                  className="text-emerald-500 hover:text-emerald-700 text-sm font-medium"
                                >
                                  Add Story
                                </button>
                              ) : (
                                <span className="text-gray-400 text-sm">Max 3 stories</span>
                              )}
                            </div>
                          </div>

                          {/* Response Section - Only show if selected */}
                          {isSelected && existingResponse && (
                            <div className="space-y-4">
                              {/* Who's Answering */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Who's answering this?
                                </label>
                                <div className="flex gap-4">
                                  {['both', 'him', 'her'].map((option) => (
                                    <label key={option} className="flex items-center space-x-2 cursor-pointer">
                                      <input
                                        type="radio"
                                        name={`answeredBy-${prompt}`}
                                        value={option}
                                        checked={existingResponse.answeredBy === option}
                                        onChange={() => {
                                          const updatedResponses = formData.promptResponses.map(pr => 
                                            pr.prompt === prompt 
                                              ? { ...pr, answeredBy: option as 'both' | 'him' | 'her' }
                                              : pr
                                          );
                                          updateFormData('promptResponses', updatedResponses);
                                        }}
                                        className="text-emerald-600 focus:ring-emerald-500"
                                      />
                                      <span className="text-sm text-gray-700 capitalize">{option}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>

                              {/* Response Input */}
                              <div>
                                {existingResponse.answeredBy === 'both' ? (
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Your answer *
                                    </label>
                                    <textarea
                                      value={existingResponse.response}
                                      onChange={(e) => {
                                        const updatedResponses = formData.promptResponses.map(pr => 
                                          pr.prompt === prompt 
                                            ? { ...pr, response: e.target.value }
                                            : pr
                                        );
                                        updateFormData('promptResponses', updatedResponses);
                                      }}
                                      placeholder="Share your story..."
                                      rows={4}
                                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                                    />
                                  </div>
                                ) : existingResponse.answeredBy === 'him' || existingResponse.answeredBy === 'her' ? (
                                  <div className="space-y-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {existingResponse.answeredBy === 'him' ? 'His' : 'Her'} answer *
                                      </label>
                                      <textarea
                                        value={existingResponse.response}
                                        onChange={(e) => {
                                          const updatedResponses = formData.promptResponses.map(pr => 
                                            pr.prompt === prompt 
                                              ? { ...pr, response: e.target.value }
                                              : pr
                                          );
                                          updateFormData('promptResponses', updatedResponses);
                                        }}
                                        placeholder={`Share ${existingResponse.answeredBy === 'him' ? 'his' : 'her'} story...`}
                                        rows={4}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {existingResponse.answeredBy === 'him' ? 'Her' : 'His'} answer *
                                      </label>
                                      <textarea
                                        value={existingResponse.response2 || ''}
                                        onChange={(e) => {
                                          const updatedResponses = formData.promptResponses.map(pr => 
                                            pr.prompt === prompt 
                                              ? { ...pr, response2: e.target.value }
                                              : pr
                                          );
                                          updateFormData('promptResponses', updatedResponses);
                                        }}
                                        placeholder={`Share ${existingResponse.answeredBy === 'him' ? 'her' : 'his'} story...`}
                                        rows={4}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                                      />
                                    </div>
                                  </div>
                                ) : null}
                              </div>

                              {/* Photo Upload */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Add a photo (optional)
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                  {existingResponse.photoPreview ? (
                                    <div className="space-y-2">
                                      <img
                                        src={existingResponse.photoPreview}
                                        alt="Preview"
                                        className="w-full h-32 object-cover rounded-lg mx-auto"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updatedResponses = formData.promptResponses.map(pr => 
                                            pr.prompt === prompt 
                                              ? { ...pr, photo: null, photoPreview: null }
                                              : pr
                                          );
                                          updateFormData('promptResponses', updatedResponses);
                                        }}
                                        className="text-red-500 hover:text-red-700 text-sm"
                                      >
                                        Remove Photo
                                      </button>
                                    </div>
                                  ) : (
                                    <div>
                                      <div className="text-2xl mb-2">📸</div>
                                      <p className="text-gray-600 mb-2">Add a photo to your story</p>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            const updatedResponses = formData.promptResponses.map(pr => 
                                              pr.prompt === prompt 
                                                ? { ...pr, photo: file, photoPreview: URL.createObjectURL(file) }
                                                : pr
                                            );
                                            updateFormData('promptResponses', updatedResponses);
                                          }
                                        }}
                                        className="hidden"
                                        id={`prompt-photo-${prompt}`}
                                      />
                                      <label
                                        htmlFor={`prompt-photo-${prompt}`}
                                        className="bg-emerald-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-emerald-600 transition-colors"
                                      >
                                        Choose Photo
                                      </label>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How We Met (Legacy - keeping for now) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How You Met (Optional)
            </label>
            <textarea
              value={formData.howWeMet}
              onChange={(e) => updateFormData('howWeMet', e.target.value)}
              placeholder="Tell us the story of how you first met..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            />
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "Wedding Details",
      description: "The when, where, and how of your special day",
      component: (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wedding Date *
            </label>
            <input
              type="date"
              value={formData.weddingDate}
              onChange={(e) => updateFormData('weddingDate', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
            
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                RSVP Deadline
              </label>
              <input
                type="date"
                value={formData.rsvpDeadline}
                onChange={(e) => updateFormData('rsvpDeadline', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ceremony Time
              </label>
              <input
                type="time"
                value={formData.ceremonyTime}
                onChange={(e) => updateFormData('ceremonyTime', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reception Time
              </label>
              <input
                type="time"
                value={formData.receptionTime}
                onChange={(e) => updateFormData('receptionTime', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Venue Name *
            </label>
            <input
              type="text"
              value={formData.venue}
              onChange={(e) => updateFormData('venue', e.target.value)}
              placeholder="e.g., Central Park Gardens"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                value={formData.venueAddress}
                onChange={(e) => updateFormData('venueAddress', e.target.value)}
                placeholder="123 Main Street"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={formData.venueCity}
                onChange={(e) => updateFormData('venueCity', e.target.value)}
                placeholder="New York"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <input
                type="text"
                value={formData.venueState}
                onChange={(e) => updateFormData('venueState', e.target.value)}
                placeholder="NY"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dress Code
              </label>
              <select
                value={formData.dressCode}
                onChange={(e) => updateFormData('dressCode', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">Select dress code</option>
                <option value="Black Tie">Black Tie</option>
                <option value="Formal">Formal</option>
                <option value="Semi-Formal">Semi-Formal</option>
                <option value="Cocktail">Cocktail</option>
                <option value="Casual">Casual</option>
                <option value="Beach Formal">Beach Formal</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wedding Theme
              </label>
              <input
                type="text"
                value={formData.theme}
                onChange={(e) => updateFormData('theme', e.target.value)}
                placeholder="e.g., Rustic Elegance, Modern Minimalist"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: "Design & Style",
      description: "Choose your perfect aesthetic",
      component: (
        <div className="space-y-6">
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Design Style *
          </label>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { value: 'modern', label: 'Modern & Clean', desc: 'Minimalist elegance' },
                { value: 'romantic', label: 'Romantic & Dreamy', desc: 'Soft, ethereal beauty' },
                { value: 'rustic', label: 'Rustic & Cozy', desc: 'Warm, natural charm' },
                { value: 'elegant', label: 'Elegant & Classic', desc: 'Timeless sophistication' },
                { value: 'bohemian', label: 'Bohemian & Free', desc: 'Artistic, carefree spirit' },
                { value: 'luxury', label: 'Luxury & Glamour', desc: 'Opulent, high-end feel' }
              ].map((style) => (
                <div
                  key={style.value}
                  onClick={() => updateFormData('designStyle', style.value)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.designStyle === style.value
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{style.label}</div>
                  <div className="text-sm text-gray-600">{style.desc}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Color Scheme
            </label>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { value: 'emerald', label: 'Emerald & Gold', colors: 'from-emerald-500 to-amber-500' },
                { value: 'rose', label: 'Rose & Blush', colors: 'from-rose-400 to-pink-300' },
                { value: 'navy', label: 'Navy & Silver', colors: 'from-blue-900 to-gray-400' },
                { value: 'purple', label: 'Purple & Lavender', colors: 'from-purple-600 to-purple-300' },
                { value: 'sage', label: 'Sage & Cream', colors: 'from-green-600 to-yellow-100' },
                { value: 'coral', label: 'Coral & Peach', colors: 'from-orange-500 to-pink-400' },
                { value: 'burgundy', label: 'Burgundy & Gold', colors: 'from-red-800 to-yellow-500' },
                { value: 'teal', label: 'Teal & Mint', colors: 'from-teal-600 to-green-300' }
              ].map((scheme) => (
                <div
                  key={scheme.value}
                  onClick={() => updateFormData('colorScheme', scheme.value)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.colorScheme === scheme.value
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-full h-8 rounded mb-2 bg-gradient-to-r ${scheme.colors}`}></div>
                  <div className="font-medium text-gray-900 text-sm">{scheme.label}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Website Features
            </label>
            <div className="space-y-3">
              {[
                { key: 'includeCountdown', label: 'Countdown Timer', desc: 'Build excitement with a beautiful countdown' },
                { key: 'includePhotoGallery', label: 'Photo Gallery', desc: 'Showcase your beautiful photos' },
                { key: 'includeGuestBook', label: 'Guest Book', desc: 'Let guests leave messages' },
                { key: 'includeRSVP', label: 'RSVP System', desc: 'Collect responses from guests' }
              ].map((feature) => (
                <label key={feature.key} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData[feature.key as keyof typeof formData] as boolean}
                    onChange={(e) => updateFormData(feature.key, e.target.checked)}
                    className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{feature.label}</div>
                    <div className="text-sm text-gray-600">{feature.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: "Your Photos",
      description: "Upload your most beautiful moments",
      component: (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-medium text-blue-900 mb-2">📸 Photo Guidelines</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• High-quality photos work best (minimum 800x600px)</li>
              <li>• We recommend 3-6 photos for the best experience</li>
              <li>• Include a mix of engagement, couple, and venue photos</li>
              <li>• Maximum file size: 5MB per photo</li>
            </ul>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hero Photo (Main Background)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <div className="text-4xl mb-2">🌟</div>
                <p className="text-gray-600 mb-4">This will be the main background of your website</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) updateFormData('heroPhoto', file);
                  }}
                  className="hidden"
                  id="hero-photo"
                />
                <label htmlFor="hero-photo" className="bg-emerald-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-emerald-600 transition-colors">
                  Choose Hero Photo
                </label>
              </div>
              {formData.heroPhoto && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                  ✓ {formData.heroPhoto.name}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couple Photo
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <div className="text-4xl mb-2">💑</div>
                <p className="text-gray-600 mb-4">A beautiful photo of the two of you</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) updateFormData('couplePhoto', file);
                  }}
                  className="hidden"
                  id="couple-photo"
                />
                <label htmlFor="couple-photo" className="bg-emerald-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-emerald-600 transition-colors">
                  Choose Couple Photo
                </label>
              </div>
              {formData.couplePhoto && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                  ✓ {formData.couplePhoto.name}
                </div>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Photos (Gallery)
            </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="text-4xl mb-4">📸</div>
              <p className="text-gray-600 mb-4">Add more photos for your gallery</p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                  updateFormData('photos', files.slice(0, 6));
              }}
              className="hidden"
              id="photo-upload"
            />
            <label htmlFor="photo-upload" className="bg-emerald-500 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-emerald-600 transition-colors">
              Choose Photos
            </label>
          </div>
          {formData.photos.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Selected photos:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {formData.photos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Photo ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => {
                      const newPhotos = formData.photos.filter((_, i) => i !== index);
                      updateFormData('photos', newPhotos);
                    }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
                </div>
            </div>
          )}
          </div>
        </div>
      )
    },
    {
      id: 6,
      title: "Guest List & RSVP",
      description: "Manage your guest list and RSVP system",
      component: (
        <div className="space-y-6">
          {/* Import Section */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="text-4xl mb-4">📊</div>
            <h4 className="font-medium text-gray-900 mb-2">Import Guest List</h4>
            <p className="text-gray-600 mb-4">
              Upload an Excel or CSV file with your guest list. We'll automatically import all your guests.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(file);
                  }
                }}
                className="hidden"
                id="guest-list-upload"
              />
              <label htmlFor="guest-list-upload" className="bg-emerald-500 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-emerald-600 transition-colors">
                Choose File
              </label>
              <a 
                href="/api/download-template" 
                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Download Template
              </a>
            </div>
            <p className="text-sm text-gray-500">
              Or add guests manually below
            </p>
          </div>

          {/* Manual Guest Addition */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Add guest name"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.target as HTMLInputElement;
                    if (input.value.trim()) {
                      updateFormData('guestList', [...formData.guestList, input.value.trim()]);
                      input.value = '';
                    }
                  }
                }}
              />
              <button
                onClick={() => {
                  const input = document.querySelector('input[placeholder="Add guest name"]') as HTMLInputElement;
                  if (input && input.value.trim()) {
                    updateFormData('guestList', [...formData.guestList, input.value.trim()]);
                    input.value = '';
                  }
                }}
                className="bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Add
              </button>
          </div>

          {formData.guestList.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Guest List ({formData.guestList.length} guests)</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {formData.guestList.map((guest, index) => (
                    <div key={index} className="flex items-center justify-between bg-white px-3 py-2 rounded border">
                    <span className="text-sm">{guest}</span>
                    <button
                      onClick={() => {
                          const newGuests = formData.guestList.filter((_, i) => i !== index);
                          updateFormData('guestList', newGuests);
                      }}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                        ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          </div>
        </div>
      )
    },
    {
      id: 7,
      title: "Additional Details",
      description: "Add the finishing touches to your website",
      component: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Registry Links
            </label>
            <textarea
              value={formData.registryLinks.join('\n')}
              onChange={(e) => updateFormData('registryLinks', e.target.value.split('\n').filter(link => link.trim()))}
              placeholder="Add your registry links (one per line)&#10;e.g., https://www.amazon.com/wedding/registry/...&#10;https://www.target.com/gift-registry/..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Accommodation Information
            </label>
            <textarea
              value={formData.accommodationInfo}
              onChange={(e) => updateFormData('accommodationInfo', e.target.value)}
              placeholder="Hotel recommendations, room blocks, or accommodation details for out-of-town guests..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transportation Information
            </label>
            <textarea
              value={formData.transportationInfo}
              onChange={(e) => updateFormData('transportationInfo', e.target.value)}
              placeholder="Parking information, shuttle services, or transportation details..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Instructions for Guests
            </label>
            <textarea
              value={formData.specialInstructions}
              onChange={(e) => updateFormData('specialInstructions', e.target.value)}
              placeholder="Any special instructions, dress code details, or important information for your guests..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            />
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps.find(step => step.id === currentStep);

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
    // Generate unique ID for the wedding website
    const weddingId = Math.random().toString(36).substring(2, 8);
    
      // Upload images to Supabase storage
      let photoUrls: string[] = [];
      let heroPhotoUrl: string | null = null;
      let couplePhotoUrl: string | null = null;
      
      // Try to upload images, but continue if it fails
      try {
        if (formData.photos.length > 0) {
          photoUrls = await uploadMultipleImages(formData.photos, weddingId);
        }
        
        if (formData.heroPhoto) {
          heroPhotoUrl = await uploadImage(formData.heroPhoto, weddingId, 'hero');
        }
        
        if (formData.couplePhoto) {
          couplePhotoUrl = await uploadImage(formData.couplePhoto, weddingId, 'couple');
        }
        
        // Upload prompt response photos
        const updatedPromptResponses = await Promise.all(
          formData.promptResponses.map(async (promptResponse, index) => {
            if (promptResponse.photo) {
              try {
                const photoUrl = await uploadImage(promptResponse.photo, weddingId, `prompt-${index}`);
                return {
                  ...promptResponse,
                  photo: photoUrl,
                  photoPreview: null // Clear the preview URL
                };
              } catch (error) {
                console.error(`Failed to upload prompt photo ${index}:`, error);
                return {
                  ...promptResponse,
                  photo: null,
                  photoPreview: null
                };
              }
            }
            return {
              ...promptResponse,
              photo: null,
              photoPreview: null
            };
          })
        );
        
        // Prepare wedding data with uploaded URLs
    const weddingData: WeddingData = {
      id: weddingId,
      coupleNames: formData.coupleNames,
      weddingDate: formData.weddingDate,
      venue: formData.venue,
      venueAddress: formData.venueAddress,
      venueCity: formData.venueCity,
      venueState: formData.venueState,
      venueZip: formData.venueZip,
      ceremonyTime: formData.ceremonyTime,
      receptionTime: formData.receptionTime,
      dressCode: formData.dressCode,
      theme: formData.theme,
      colorScheme: formData.colorScheme,
      howWeMet: formData.howWeMet,
      promptResponses: updatedPromptResponses,
      registryLinks: formData.registryLinks,
      accommodationInfo: formData.accommodationInfo,
      transportationInfo: formData.transportationInfo,
      specialInstructions: formData.specialInstructions,
      rsvpDeadline: formData.rsvpDeadline,
      guestList: formData.guestList,
      photos: photoUrls,
      heroPhoto: heroPhotoUrl,
      couplePhoto: couplePhotoUrl,
      createdAt: new Date().toISOString()
    };
    
    // Add expiration information to track 24-hour limit
    const creationTimestamp = new Date().getTime();
    weddingData.createdAt = new Date().toISOString();
    weddingData.expiresAt = new Date(creationTimestamp + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
    weddingData.claimed = false;
    
    // If user is logged in, associate with them
    if (user) {
      weddingData.userId = user.email;
      weddingData.email = user.email;
      weddingData.claimed = true; // Already claimed if created while logged in
      
      // Add to user's wedding sites list
      const users = JSON.parse(localStorage.getItem('users') || '{}');
      const userEmail = user.email || '';
      
      if (users[userEmail]) {
        if (!users[userEmail].weddingSites) {
          users[userEmail].weddingSites = [];
        }
        
        users[userEmail].weddingSites.push(weddingId);
        localStorage.setItem('users', JSON.stringify(users));
      }
    }

    // Save to localStorage (in real app, this would go to database)
    const existingWeddings = JSON.parse(localStorage.getItem('weddings') || '{}');
    existingWeddings[weddingId] = weddingData;
    localStorage.setItem('weddings', JSON.stringify(existingWeddings));
    
    console.log('Wedding data saved:', weddingData);
    
    // Redirect to success page with the wedding ID
    window.location.href = `/create/success?id=${weddingId}`;
        
      } catch (uploadError) {
        console.error('Image upload failed:', uploadError);
        
        // Show user-friendly error message
        let errorMessage = 'Image upload failed. Your wedding website will be created without images for now.';
        
        if (uploadError instanceof Error) {
          if (uploadError.message.includes('bucket') || uploadError.message.includes('not found')) {
            errorMessage = `Image upload failed: Storage bucket not configured. 

To fix this:
1. Go to https://supabase.com/dashboard
2. Select your project: nqkbmhschakblncqgewa
3. Click "Storage" in the left sidebar
4. Click "Create a new bucket"
5. Name it: wedding-images
6. Check "Public bucket"
7. Set file size limit to 50MB
8. Set allowed MIME types to: image/*
9. Click "Create bucket"
10. Go to Storage > Policies and add:
    - Policy name: "Public read access"
    - Target roles: public
    - Policy definition: SELECT
    - Using expression: true
11. Add another policy:
    - Policy name: "Authenticated uploads"
    - Target roles: authenticated
    - Policy definition: INSERT
    - Using expression: true

Your wedding website will be created without images for now.`;
          } else {
            errorMessage = `Image upload failed: ${uploadError.message}. Your wedding website will be created without images for now.`;
          }
        }
        
        if (confirm(`${errorMessage}\n\nWould you like to continue without images?`)) {
          // Continue without images
          const weddingData = {
            id: weddingId,
            ...formData,
            promptResponses: formData.promptResponses.map(pr => ({
              ...pr,
              photo: null,
              photoPreview: null
            })),
            photos: [],
            heroPhoto: null,
            couplePhoto: null,
            createdAt: new Date().toISOString()
          };
          
          // Save to localStorage
          const existingWeddings = JSON.parse(localStorage.getItem('weddings') || '{}');
          existingWeddings[weddingId] = weddingData;
          localStorage.setItem('weddings', JSON.stringify(existingWeddings));
          
          console.log('Wedding data saved (without images):', weddingData);
          
          // Redirect to success page
          window.location.href = `/create/success?id=${weddingId}`;
        } else {
          // User chose to cancel
          setIsSubmitting(false);
          return;
        }
      }
      
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // No auth check required - users can create a site without logging in first
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Floating Progress Indicator */}
      {showFloatingProgress && currentStep === 2 && (
        <div className="fixed top-4 right-4 z-50 bg-white shadow-lg rounded-lg p-4 border border-emerald-200 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-sm">
              {formData.promptResponses.length}/3
            </div>
            <div className="flex-1 min-w-[120px]">
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-300 ease-out shadow-sm"
                  style={{ width: `${(formData.promptResponses.length / 3) * 100}%` }}
                ></div>
              </div>
            </div>
            <span className="text-emerald-700 font-medium text-sm">
              {formData.promptResponses.length === 0 && "Start"}
              {formData.promptResponses.length === 1 && "1/3"}
              {formData.promptResponses.length === 2 && "2/3"}
              {formData.promptResponses.length === 3 && "Done!"}
            </span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Logo size="md" className="text-black" />
            <div className="text-sm text-gray-500">
              Step {currentStep} of {steps.length}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.id <= currentStep 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step.id}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step.id < currentStep ? 'bg-emerald-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="mb-8">
            <h1 className="font-playfair text-3xl font-light text-gray-900 mb-2">
              {currentStepData?.title}
            </h1>
            <p className="text-gray-600">
              {currentStepData?.description}
            </p>
          </div>

          <div className="min-h-[400px]">
            {currentStepData?.component}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Previous
          </button>

          {currentStep < steps.length ? (
            <button
              onClick={handleNext}
              className="bg-emerald-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-emerald-600 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                isSubmitting 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-emerald-500 text-white hover:bg-emerald-600'
              }`}
            >
              {isSubmitting ? 'Creating Website...' : 'Create My Website'}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
