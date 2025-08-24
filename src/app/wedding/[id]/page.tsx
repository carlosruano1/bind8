'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { isWeddingExpired, getExpirationStatus } from '@/lib/expirationUtils';
import Logo from '@/components/Logo';
import { motion } from 'framer-motion';

interface PromptResponse {
  prompt: string;
  response: string;
  response2?: string; // For separate him/her responses
  photo: string | null;
  photoPreview: string | null;
  answeredBy?: 'both' | 'him' | 'her';
}

interface WeddingData {
  id: string;
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
  story: string;
  howWeMet: string;
  proposal: string;
  favoriteThings: string;
  promptResponses: PromptResponse[];
  photos: string[];
  heroPhoto: string | null;
  couplePhoto: string | null;
  guestList: string[];
  rsvpDeadline: string;
  registryLinks: string[];
  accommodationInfo: string;
  transportationInfo: string;
  specialInstructions: string;
  designStyle: string;
  includeCountdown: boolean;
  includePhotoGallery: boolean;
  includeGuestBook: boolean;
  includeRSVP: boolean;
  createdAt: string;
}

interface Guest {
  name: string;
  email?: string;
  rsvp: 'yes' | 'no' | 'pending';
  plusOne?: boolean;
  plusOneName?: string;
  dietaryRestrictions?: string;
  songSuggestion?: string;
  submittedAt?: string;
}

// Legacy interface - keeping for backward compatibility
interface RSVPData {
  guestName: string;
  email: string;
  attending: boolean;
  numberOfGuests: number;
  plusOneName?: string;
  dietaryRestrictions: string;
  songSuggestion: string;
  submittedAt: string;
}

interface SongSuggestion {
  id: string;
  title: string;
  artist: string;
  votes: number;
  suggestedBy: string;
  suggestedAt: string;
  votedBy: string[]; // Track who has voted for this song
}

export default function WeddingWebsite() {
  const params = useParams();
  const [weddingData, setWeddingData] = useState<WeddingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Error and status states
  const [error, setError] = useState<string | null>(null);
  
  // Guest search and RSVP states
  const [searchTerm, setSearchTerm] = useState('');
  const [foundGuest, setFoundGuest] = useState<Guest | null>(null);
  const [showRSVP, setShowRSVP] = useState(false);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [rsvpData, setRsvpData] = useState<RSVPData>({
    guestName: '',
    email: '',
    attending: true,
    numberOfGuests: 1,
    dietaryRestrictions: '',
    songSuggestion: '',
    submittedAt: ''
  });
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [songSuggestions, setSongSuggestions] = useState<SongSuggestion[]>([]);
  const [songSearchResults, setSongSearchResults] = useState<any[]>([]);
  const [showSongSearch, setShowSongSearch] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [expirationWarning, setExpirationWarning] = useState<{show: boolean, hoursRemaining: number}>({
    show: false,
    hoursRemaining: 0
  });
  const shareImageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const weddingId = params.id as string;
    
    // Load wedding data from localStorage
    const existingWeddings = JSON.parse(localStorage.getItem('weddings') || '{}');
    const wedding = existingWeddings[weddingId];
    
    if (wedding) {
      // Check if wedding is expired
      if (isWeddingExpired(wedding)) {
        setError('This wedding website has expired');
        setIsLoading(false);
        return;
      }
      
      // Check if unclaimed and approaching expiration
      if (!wedding.claimed && wedding.expiresAt) {
        const expirationDate = new Date(wedding.expiresAt);
        const now = new Date();
        const hoursRemaining = Math.round((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60));
        
        // If less than 6 hours remaining, show warning
        if (hoursRemaining < 6) {
          setExpirationWarning({
            show: true,
            hoursRemaining: hoursRemaining > 0 ? hoursRemaining : 0
          });
        }
      }
      
      setWeddingData(wedding);
      
      // Load guest list - use the unified guest list format that matches the admin panel
      try {
        // First check if we have the new format guest list
        const storedGuests = localStorage.getItem(`guests_${weddingId}`);
        
        if (storedGuests) {
          // Use the new format guest list
          setGuests(JSON.parse(storedGuests));
        } else {
          // Convert from old format if needed
          const storedRsvps = localStorage.getItem(`rsvps_${weddingId}`);
          const guestList = wedding.guestList || [];
          
          if (storedRsvps) {
            // Convert old RSVPs to new Guest format
            const oldRsvps = JSON.parse(storedRsvps);
            const convertedGuests: Guest[] = [];
            
            // Add guests from the guest list
            guestList.forEach((name: string) => {
              // Check if this guest has an RSVP
              const existingRsvp = oldRsvps.find((rsvp: RSVPData) => 
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
            oldRsvps.forEach((rsvp: RSVPData) => {
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
            
            setGuests(convertedGuests);
            
            // Save in the new format
            localStorage.setItem(`guests_${weddingId}`, JSON.stringify(convertedGuests));
          } else {
            // No RSVPs yet, just create from guest list
            const newGuests = guestList.map((name: string) => ({
              name,
              rsvp: 'pending' as const
            }));
            
            setGuests(newGuests);
            localStorage.setItem(`guests_${weddingId}`, JSON.stringify(newGuests));
          }
        }
      } catch (error) {
        console.error('Error loading guest list:', error);
      }
      
      setIsLoading(false);
      setIsLoaded(true);
    } else {
      setError('Wedding not found');
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    const handleScroll = () => {
      // Throttle scroll events for better performance
      if (!window.requestAnimationFrame) {
        setScrollY(window.scrollY);
        return;
      }
      
      window.requestAnimationFrame(() => {
        setScrollY(window.scrollY);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const searchGuest = () => {
    if (!searchTerm.trim() || !weddingData || guests.length === 0) return;
    
    // Split search term into parts (first name, last name)
    const searchParts = searchTerm.trim().toLowerCase().split(/\s+/);
    
    // Find exact matches first (full name)
    let foundGuest = guests.find(guest => 
      guest.name.toLowerCase() === searchTerm.toLowerCase()
    );
    
    // If no exact match, try to match full name parts
    if (!foundGuest) {
      foundGuest = guests.find(guest => {
        const guestParts = guest.name.toLowerCase().split(/\s+/);
        
        // Check if all search parts are contained in the guest name
        return searchParts.every(part => 
          guestParts.some(guestPart => guestPart === part)
        );
      });
    }
    
    // If still no match, try partial match but require at least first name + part of last name
    if (!foundGuest && searchParts.length > 1) {
      foundGuest = guests.find(guest => {
        const guestParts = guest.name.toLowerCase().split(/\s+/);
        
        // First part must match exactly, and at least part of the last name
        return guestParts[0] === searchParts[0] && 
               guestParts.some((guestPart, i) => 
                 i > 0 && searchParts.some((searchPart, j) => 
                   j > 0 && guestPart.startsWith(searchPart)
                 )
               );
      });
    }
    
    // If still no match, check for any partial match of first and last name
    if (!foundGuest && searchParts.length > 1) {
      foundGuest = guests.find(guest => {
        const guestParts = guest.name.toLowerCase().split(/\s+/);
        
        // Check if first and last name parts partially match
        return (guestParts[0].includes(searchParts[0]) || searchParts[0].includes(guestParts[0])) && 
               (guestParts.length > 1 && searchParts.length > 1 && 
                (guestParts[guestParts.length-1].includes(searchParts[searchParts.length-1]) || 
                 searchParts[searchParts.length-1].includes(guestParts[guestParts.length-1])));
      });
    }
    
    // Also check for email matches
    if (!foundGuest) {
      foundGuest = guests.find(guest => 
        guest.email && guest.email.toLowerCase() === searchTerm.toLowerCase()
      );
    }
    
    if (foundGuest) {
      setFoundGuest(foundGuest);
      
      // Pre-fill the form with the guest's data
      setRsvpData({
        guestName: foundGuest.name,
        email: foundGuest.email || '',
        attending: foundGuest.rsvp === 'yes',
        numberOfGuests: foundGuest.plusOne ? 2 : 1,
        dietaryRestrictions: foundGuest.dietaryRestrictions || '',
        songSuggestion: foundGuest.songSuggestion || '',
        submittedAt: foundGuest.submittedAt || ''
      });
    } else {
      setFoundGuest(null);
    }
  };

  const handleRSVPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!foundGuest) {
      alert("Please verify your name on the guest list before submitting.");
      return;
    }
    
    if (!rsvpData.email) {
      alert("Please provide your email address.");
      return;
    }
    
    const weddingId = params.id as string;
    
    // Get guest's plus one name if applicable
    const plusOneName = rsvpData.numberOfGuests > 1 ? 
      (document.querySelector('input[placeholder="Enter your guest\'s name"]') as HTMLInputElement)?.value || "Guest" : 
      "";
    
    // Update the guest in our unified guest list
    const updatedGuests = [...guests];
    const guestIndex = updatedGuests.findIndex(g => 
      g.name.toLowerCase() === foundGuest.name.toLowerCase()
    );
    
    if (guestIndex >= 0) {
      // Update existing guest
      updatedGuests[guestIndex] = {
        ...updatedGuests[guestIndex],
        name: foundGuest.name, // Keep the canonical name
        email: rsvpData.email,
        rsvp: rsvpData.attending ? 'yes' : 'no',
        plusOne: rsvpData.numberOfGuests > 1,
        plusOneName: plusOneName,
        dietaryRestrictions: rsvpData.dietaryRestrictions,
        songSuggestion: rsvpData.songSuggestion,
        submittedAt: new Date().toISOString()
      };
    } else {
      // This shouldn't happen normally since foundGuest should be in the list
      // But just in case, add the guest
      updatedGuests.push({
        name: foundGuest.name,
        email: rsvpData.email,
        rsvp: rsvpData.attending ? 'yes' : 'no',
        plusOne: rsvpData.numberOfGuests > 1,
        plusOneName: plusOneName,
        dietaryRestrictions: rsvpData.dietaryRestrictions,
        songSuggestion: rsvpData.songSuggestion,
        submittedAt: new Date().toISOString()
      });
    }
    
    // Check for duplicate email with different name
    const emailDuplicateIndex = updatedGuests.findIndex(g => 
      g.email && 
      g.email.toLowerCase() === rsvpData.email.toLowerCase() && 
      g.name.toLowerCase() !== foundGuest.name.toLowerCase()
    );
    
    if (emailDuplicateIndex >= 0) {
      // Found a duplicate email with different name
      // This is likely the same person, so update this entry with the new data
      // and mark it for removal
      updatedGuests.splice(emailDuplicateIndex, 1);
    }
    
    // Save the updated guest list
    setGuests(updatedGuests);
    localStorage.setItem(`guests_${weddingId}`, JSON.stringify(updatedGuests));
    
    // For backward compatibility, also update the old format
    const legacyRsvp = {
      guestName: foundGuest.name,
      email: rsvpData.email,
      attending: rsvpData.attending,
      numberOfGuests: rsvpData.numberOfGuests,
      plusOneName: plusOneName,
      dietaryRestrictions: rsvpData.dietaryRestrictions,
      songSuggestion: rsvpData.songSuggestion,
      submittedAt: new Date().toISOString()
    };
    
    const existingRSVPs = JSON.parse(localStorage.getItem(`rsvps_${weddingId}`) || '[]');
    
    // Check if this guest has already RSVP'd
    const existingIndex = existingRSVPs.findIndex((rsvp: RSVPData) => 
      rsvp.guestName.toLowerCase() === foundGuest.name.toLowerCase()
    );
    
    if (existingIndex >= 0) {
      // Update existing RSVP
      existingRSVPs[existingIndex] = legacyRsvp;
    } else {
      // Add new RSVP
      existingRSVPs.push(legacyRsvp);
    }
    
    localStorage.setItem(`rsvps_${weddingId}`, JSON.stringify(existingRSVPs));
    
    // Add song suggestion if provided
    if (rsvpData.songSuggestion.trim()) {
      const newSong: SongSuggestion = {
        id: Math.random().toString(36).substring(2),
        title: rsvpData.songSuggestion,
        artist: 'Unknown Artist',
        votes: 1,
        suggestedBy: foundGuest.name,
        suggestedAt: new Date().toISOString(),
        votedBy: [foundGuest.name] // Initialize with the suggester
      };
      
      const updatedSongs = [...songSuggestions, newSong];
      setSongSuggestions(updatedSongs);
      localStorage.setItem(`songs_${weddingId}`, JSON.stringify(updatedSongs));
    }
    
    setRsvpSubmitted(true);
    
    // Scroll to the thank you message
    setTimeout(() => {
      const thankYouElement = document.querySelector('.bg-green-50');
      if (thankYouElement) {
        thankYouElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const searchSongs = async (query: string) => {
    if (!query.trim()) {
      setSongSearchResults([]);
      return;
    }
    
    try {
      // Use a curated list of wedding songs
      const weddingSongs = [
        { name: 'Perfect', artists: [{ name: 'Ed Sheeran' }] },
        { name: 'All of Me', artists: [{ name: 'John Legend' }] },
        { name: 'Marry Me', artists: [{ name: 'Train' }] },
        { name: 'A Thousand Years', artists: [{ name: 'Christina Perri' }] },
        { name: 'Can\'t Help Falling in Love', artists: [{ name: 'Elvis Presley' }] },
        { name: 'At Last', artists: [{ name: 'Etta James' }] },
        { name: 'Unchained Melody', artists: [{ name: 'The Righteous Brothers' }] },
        { name: 'Wonderful Tonight', artists: [{ name: 'Eric Clapton' }] },
        { name: 'Just the Way You Are', artists: [{ name: 'Bruno Mars' }] },
        { name: 'Thinking Out Loud', artists: [{ name: 'Ed Sheeran' }] },
        { name: 'You Are the Reason', artists: [{ name: 'Calum Scott' }] },
        { name: 'Shallow', artists: [{ name: 'Lady Gaga & Bradley Cooper' }] },
        { name: 'Love Story', artists: [{ name: 'Taylor Swift' }] },
        { name: 'Make You Feel My Love', artists: [{ name: 'Adele' }] },
        { name: 'I Don\'t Want to Miss a Thing', artists: [{ name: 'Aerosmith' }] },
        { name: 'Amazed', artists: [{ name: 'Lonestar' }] },
        { name: 'Speechless', artists: [{ name: 'Dan + Shay' }] },
        { name: 'From This Moment On', artists: [{ name: 'Shania Twain' }] },
        { name: 'Lover', artists: [{ name: 'Taylor Swift' }] },
        { name: 'Endless Love', artists: [{ name: 'Lionel Richie & Diana Ross' }] },
        { name: 'Bless the Broken Road', artists: [{ name: 'Rascal Flatts' }] },
        { name: 'Can You Feel the Love Tonight', artists: [{ name: 'Elton John' }] },
        { name: 'Everything', artists: [{ name: 'Michael Bublé' }] },
        { name: 'Die a Happy Man', artists: [{ name: 'Thomas Rhett' }] },
        { name: 'Better Together', artists: [{ name: 'Jack Johnson' }] },
        { name: 'Chasing Cars', artists: [{ name: 'Snow Patrol' }] },
        { name: 'Marry You', artists: [{ name: 'Bruno Mars' }] },
        { name: 'Uptown Funk', artists: [{ name: 'Mark Ronson ft. Bruno Mars' }] },
        { name: 'Dancing Queen', artists: [{ name: 'ABBA' }] },
        { name: 'Don\'t Stop Believin\'', artists: [{ name: 'Journey' }] }
        ];
        
        // Filter based on query
      const results = weddingSongs.filter(song => 
          song.name.toLowerCase().includes(query.toLowerCase()) ||
          song.artists[0].name.toLowerCase().includes(query.toLowerCase())
      );
      
      // If no results found, add some custom results
      if (results.length === 0) {
        results.push(
          { name: query, artists: [{ name: 'Custom Song' }] }
        );
      }
      
      setSongSearchResults(results);
    } catch (error) {
      console.error('Error searching songs:', error);
      // Fallback to mock results if all else fails
      const mockResults = [
        { name: query, artists: [{ name: 'Custom Song' }] },
        { name: `${query} (Dance Mix)`, artists: [{ name: 'DJ Wedding' }] },
        { name: `${query} (Wedding Version)`, artists: [{ name: 'Wedding Band' }] },
      ];
      setSongSearchResults(mockResults);
    }
  };

  const voteForSong = (songId: string) => {
    // We'll use the guest name directly from foundGuest
    
    // Check if user has already voted for this song
    const song = songSuggestions.find(s => s.id === songId);
    const guestName = foundGuest ? foundGuest.name : 'Guest';
    
    if (song && song.votedBy.includes(guestName)) {
      alert('You have already voted for this song!');
      return;
    }
    
    const updatedSongs = songSuggestions.map(song => {
      if (song.id === songId) {
        const newVotedBy = [...song.votedBy, guestName];
        return { ...song, votes: song.votes + 1, votedBy: newVotedBy };
      }
      return song;
    });
    setSongSuggestions(updatedSongs);
    
    const weddingId = params.id as string;
    localStorage.setItem(`songs_${weddingId}`, JSON.stringify(updatedSongs));
  };

  const selectSongFromSearch = (song: any) => {
    setRsvpData(prev => ({ 
      ...prev, 
      songSuggestion: `${song.name} - ${song.artists[0].name}` 
    }));
    setShowSongSearch(false);
    setSongSearchResults([]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-rose-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-light text-lg md:text-xl">Loading your special day...</p>
        </div>
      </div>
    );
  }

  if (error || !weddingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="font-playfair text-2xl md:text-4xl font-light text-gray-800 mb-4">
            {error || "Wedding Not Found"}
          </h1>
          <p className="text-gray-600 font-light">
            {error 
              ? "This wedding website is no longer available. The couple may have upgraded to a premium account to keep it online."
              : "The wedding you're looking for doesn't exist."
            }
          </p>
          <div className="mt-8">
            <a 
              href="/"
              className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Go to Homepage
            </a>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysUntilWedding = () => {
    const weddingDate = new Date(weddingData.weddingDate);
    const today = new Date();
    const diffTime = weddingDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Function to extract first names from couple names
  const getFirstNames = () => {
    if (!weddingData.coupleNames) return { firstName: '', secondName: '' };
    
    // Step 1: Handle various text and symbol separators
    // This regex matches common separators: &, +, and, y, et, etc.
    const coupleNameString = weddingData.coupleNames;
    
    // Try to split by common separators
    let names: string[] = [];
    
    // First try symbolic separators
    if (coupleNameString.includes('&') || coupleNameString.includes('+')) {
      names = coupleNameString.split(/[&+]/).map(name => name.trim()).filter(Boolean);
    } 
    // Then try word separators with word boundaries to avoid matching inside names
    else if (
      /\band\b/i.test(coupleNameString) || 
      /\by\b/i.test(coupleNameString) || 
      /\bet\b/i.test(coupleNameString)
    ) {
      names = coupleNameString
        .replace(/\band\b/i, '&')
        .replace(/\by\b/i, '&')
        .replace(/\bet\b/i, '&')
        .split('&')
        .map(name => name.trim())
        .filter(Boolean);
    } 
    // If no separator found, try to split by space and assume two names
    else {
      const allWords = coupleNameString.split(/\s+/);
      
      // If we have at least two words, assume first and last words are the first names
      if (allWords.length >= 2) {
        // Try to intelligently split into two names
        const midpoint = Math.floor(allWords.length / 2);
        names = [
          allWords.slice(0, midpoint).join(' '),
          allWords.slice(midpoint).join(' ')
        ];
      } else {
        names = [coupleNameString]; // Just one name found
      }
    }
    
    // Step 2: Extract first names from each person's full name
    if (names.length >= 2) {
      return {
        firstName: names[0].split(/\s+/)[0], // First name of first person
        secondName: names[1].split(/\s+/)[0] // First name of second person
      };
    } else if (names.length === 1) {
      // If only one name is provided, try to split by spaces
      const nameParts = names[0].split(/\s+/);
      if (nameParts.length >= 2) {
        // If there are multiple words, assume first and last are first names
        return {
          firstName: nameParts[0] || '',
          secondName: nameParts[nameParts.length - 1] || ''
        };
      } else {
        return {
          firstName: nameParts[0] || '',
          secondName: ''
        };
      }
    }
    return { firstName: '', secondName: '' };
  };

  // Function to get appropriate color scheme classes based on the wedding's theme
  const getColorScheme = () => {
    const schemes = {
      emerald: 'from-emerald-500 to-amber-500',
      rose: 'from-rose-400 to-pink-300',
      navy: 'from-blue-900 to-gray-400',
      purple: 'from-purple-600 to-purple-300',
      sage: 'from-green-600 to-yellow-100',
      coral: 'from-orange-500 to-pink-400',
      burgundy: 'from-red-800 to-yellow-500',
      teal: 'from-teal-600 to-green-300'
    };
    return schemes[weddingData.colorScheme as keyof typeof schemes] || 'from-rose-400 to-pink-300';
  };
  
  // Get lighter gradient for backgrounds
  const getLightColorScheme = () => {
    const schemes = {
      emerald: 'from-emerald-50 to-amber-50',
      rose: 'from-rose-50 to-pink-50',
      navy: 'from-blue-50 to-gray-100',
      purple: 'from-purple-50 to-purple-100',
      sage: 'from-green-50 to-yellow-50',
      coral: 'from-orange-50 to-pink-50',
      burgundy: 'from-red-50 to-yellow-50',
      teal: 'from-teal-50 to-green-50'
    };
    return schemes[weddingData.colorScheme as keyof typeof schemes] || 'from-rose-50 to-pink-50';
  };

  const topSongs = [...songSuggestions].sort((a, b) => b.votes - a.votes).slice(0, 10);
  
  // Function to render expiration warning
  const renderExpirationWarning = () => {
    if (!expirationWarning.show) return null;
    
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-amber-600 text-white z-50 shadow-lg">
        <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between text-center sm:text-left">
          <div className="mb-3 sm:mb-0">
            <span className="font-bold">⚠️ Warning:</span> This wedding site expires in {expirationWarning.hoursRemaining} {expirationWarning.hoursRemaining === 1 ? 'hour' : 'hours'}!
          </div>
          <div className="flex gap-3">
            <a
              href={`/signup?wedding_id=${params.id}`}
              className="bg-white text-amber-800 px-4 py-1.5 rounded font-medium hover:bg-amber-50"
            >
              Create Account
            </a>
            <a
              href={`/login?wedding_id=${params.id}`}
              className="bg-amber-700 text-white px-4 py-1.5 rounded font-medium hover:bg-amber-800"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-playfair overflow-x-hidden">
      {/* Expiration Warning Banner */}
      {renderExpirationWarning()}
      
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-3 md:py-4">
            {/* Logo/Couple Names */}
            <div className="flex-shrink-0">
              <h1 className="font-playfair text-lg md:text-xl font-light">
                {weddingData.coupleNames}
              </h1>
            </div>
            
            {/* Navigation Links */}
            <div className="flex items-center space-x-4 md:space-x-8">
              <a href="#details" className="text-sm md:text-base text-gray-700 hover:text-gray-900 transition-colors">Details</a>
              {weddingData.includePhotoGallery && (
                <a href="#photos" className="text-sm md:text-base text-gray-700 hover:text-gray-900 transition-colors">Photos</a>
              )}
              <div className="relative group">
                <button className="text-sm md:text-base text-gray-700 hover:text-gray-900 transition-colors flex items-center">
                  Info
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                  <a 
                    href="#registry" 
                    onClick={(e) => {
                      e.preventDefault();
                      const registrySection = document.querySelector('[data-section="registry"]');
                      if (registrySection) registrySection.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Registry
                  </a>
                  <a 
                    href="#accommodations" 
                    onClick={(e) => {
                      e.preventDefault();
                      const accomSection = document.querySelector('[data-section="accommodations"]');
                      if (accomSection) accomSection.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Accommodations
                  </a>
                  <a 
                    href="#travel" 
                    onClick={(e) => {
                      e.preventDefault();
                      const travelSection = document.querySelector('[data-section="travel"]');
                      if (travelSection) travelSection.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Travel Info
                  </a>
                  <a 
                    href="#activities" 
                    onClick={(e) => {
                      e.preventDefault();
                      const activitiesSection = document.querySelector('[data-section="activities"]');
                      if (activitiesSection) activitiesSection.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Things to Do
                  </a>
                </div>
              </div>
              {/* Always show RSVP link */}
              <a 
                href="#rsvp" 
                className={`text-sm md:text-base px-3 py-1 rounded-full bg-gradient-to-r ${getColorScheme()} text-white hover:opacity-90 transition-all`}
              >
                RSVP
              </a>
            </div>
          </div>
        </div>
      </nav>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with size-proof handling */}
        <div className="absolute inset-0">
          <div className="relative w-full h-full">
            <img
              src={weddingData.heroPhoto || weddingData.photos[0] || '/images/default-hero.jpg'}
              alt="Wedding couple"
              className="w-full h-full object-cover object-center"
              style={{
                transform: `translateY(${scrollY * 0.2}px) scale(1.02)`,
                transition: 'transform 0.1s ease-out'
              }}
              loading="eager"
              decoding="async"
            />
            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/30 to-black/50" />
          </div>
        </div>
        
        {/* Elegant floating elements - Reduced on mobile */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 md:w-2 md:h-2 bg-white/20 rounded-full animate-float"
              style={{
                left: `${20 + (i * 20)}%`,
                top: `${30 + (i * 10)}%`,
                animationDelay: `${i * 0.8}s`,
                animationDuration: `${10 + (i % 4)}s`
              }}
            />
              ))}
            </div>
        
        {/* Hero Content */}
        <div className={`relative z-10 text-center max-w-6xl mx-auto px-4 sm:px-6 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Elegant Countdown */}
          {weddingData.includeCountdown && (
            <div className="mb-8 md:mb-12 animate-fade-in-up">
              <div className="inline-flex items-center justify-center w-20 h-20 md:w-32 md:h-32 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 mb-4 md:mb-6 shadow-2xl">
                <span className="font-playfair text-2xl md:text-4xl font-light text-white">
                  {getDaysUntilWedding()}
                </span>
          </div>
              <div className="text-white/90 font-playfair text-base md:text-xl tracking-wider">Days Until Our Wedding</div>
        </div>
          )}
          
          <h1 className="font-playfair text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-light mb-4 md:mb-8 tracking-wider text-white drop-shadow-2xl px-4">
              {weddingData.coupleNames}
            </h1>
          
          <div className="w-24 md:w-32 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent mx-auto mb-4 md:mb-8" />
          
          <p className="font-playfair text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/90 mb-4 md:mb-8 tracking-wider px-4">
              {formatDate(weddingData.weddingDate)}
            </p>
          
          <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed font-light px-4">
            Join us for an intimate celebration of love and commitment
            </p>
          </div>
        </section>

      {/* Our Story Section */}
      {((weddingData.promptResponses && weddingData.promptResponses.length > 0) || 
        weddingData.howWeMet || 
        weddingData.proposal || 
        weddingData.story || 
        weddingData.favoriteThings) && (
        <section className={`relative min-h-screen bg-gradient-to-br ${getLightColorScheme()}`}>
          {/* Background Image */}
          <div className="absolute inset-0 opacity-20">
            <div className="relative w-full h-full">
              <img
                src={weddingData.couplePhoto || weddingData.photos[1] || weddingData.photos[0]}
                alt="Couple story"
                className="w-full h-full object-cover object-center"
                style={{
                  transform: `translateY(${scrollY * 0.1}px) scale(1.01)`,
                  transition: 'transform 0.1s ease-out'
                }}
                loading="lazy"
              />
            </div>
          </div>
          
          {/* Content */}
          <div className="relative z-10 container mx-auto px-4 sm:px-6 py-12 md:py-24">
            <div className="max-w-7xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-16 md:mb-24 relative z-20">
                <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-light text-gray-900 mb-4 md:mb-8 tracking-wider">
                  Our Story
                </h2>
                <div className={`w-16 md:w-24 h-px bg-gradient-to-r ${getColorScheme()} mx-auto`} />
              </div>
              
              {/* Flashcard Display */}
              {weddingData.promptResponses && weddingData.promptResponses.length > 0 ? (
                <div>
                  {/* Navigation Arrows */}
                  <button
                    onClick={() => setCurrentStoryIndex((prev) => (prev - 1 + weddingData.promptResponses.length) % weddingData.promptResponses.length)}
                    className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-600 hover:text-gray-900 rounded-full p-2 md:p-3 shadow-lg transition-all duration-300 z-20 flex items-center justify-center hover:scale-110"
                    style={{ width: '44px', height: '44px' }}
                    aria-label="Previous story"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => setCurrentStoryIndex((prev) => (prev + 1) % weddingData.promptResponses.length)}
                    className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-600 hover:text-gray-900 rounded-full p-2 md:p-3 shadow-lg transition-all duration-300 z-20 flex items-center justify-center hover:scale-110"
                    style={{ width: '44px', height: '44px' }}
                    aria-label="Next story"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  <div className="relative mx-auto max-w-5xl min-h-[560px] md:min-h-[640px] flex items-center justify-center">
                    {weddingData.promptResponses.map((promptResponse, index) => (
                      <motion.div
                        key={index}
                        className={`absolute w-full max-w-lg transition-all duration-700 ${
                          index === currentStoryIndex 
                            ? 'z-10 opacity-100 translate-x-0' 
                            : index < currentStoryIndex 
                              ? 'z-0 opacity-0 -translate-x-full' 
                              : 'z-0 opacity-0 translate-x-full'
                        }`}
                        initial={{ opacity: 0, x: index < currentStoryIndex ? -100 : 100 }}
                        animate={{ 
                          opacity: index === currentStoryIndex ? 1 : 0, 
                          x: index === currentStoryIndex ? 0 : index < currentStoryIndex ? -100 : 100,
                          scale: 1
                        }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      >
                        <div 
                          className={`group relative min-h-[480px] md:min-h-[540px] flex flex-col bg-white/95 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl border border-gray-200/50 overflow-hidden transition-all duration-500 hover:shadow-2xl w-full mx-auto ring-1 ring-opacity-30 ${getColorScheme()}`}
                        >
                          {/* Card Header */}
                          <div className={`bg-gradient-to-r ${getLightColorScheme()} p-4 md:p-6 border-b border-gray-200/50 relative overflow-hidden hover:bg-opacity-50 transition-all duration-300`}>
                            {/* Decorative elements */}
                            <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                              <div className={`absolute top-2 md:top-4 right-2 md:right-4 w-8 md:w-12 h-8 md:h-12 border-2 rounded-full animate-pulse ${getColorScheme()}`}></div>
                              <div className={`absolute bottom-2 md:bottom-4 left-2 md:left-4 w-4 md:w-6 h-4 md:h-6 border rounded-full ${getColorScheme()}`}></div>
                            </div>
                            
                            <div className="flex items-center justify-between mb-2 md:mb-4 relative z-10">
                              <span className={`font-medium text-xs md:text-sm bg-white/60 px-2 md:px-3 py-1 rounded-full group-hover:bg-white/80 transition-all duration-300 ${getColorScheme()} bg-clip-text text-transparent`}>
                                Story #{index + 1}
                              </span>
                            </div>
                            <h4 className="font-playfair text-base md:text-xl font-light text-gray-800 leading-tight relative z-10 group-hover:text-gray-900 transition-colors duration-300">
                              {promptResponse.prompt}
                            </h4>
                          </div>
                          
                          {/* Card Content - Scrollable text */}
                          <div className="p-4 md:p-6 flex-1 overflow-y-auto">
                            <div className="space-y-3 md:space-y-4">
                              {promptResponse.answeredBy === 'both' || !promptResponse.answeredBy ? (
                                <div className="bg-gradient-to-br from-gray-50/70 to-gray-100/70 p-3 md:p-4 rounded-xl md:rounded-2xl border border-gray-200/30">
                                  <h5 className="font-medium text-gray-900 mb-2 text-xs md:text-sm flex items-center">
                                    <span className={`w-2 h-2 rounded-full mr-2 ${getColorScheme()}`}></span>
                                    {getFirstNames().firstName && getFirstNames().secondName 
                                      ? `${getFirstNames().firstName} & ${getFirstNames().secondName} answered:`
                                      : 'They answered:'
                                    }
                                  </h5>
                                  <p className="text-gray-700 leading-relaxed font-light text-sm md:text-base">
                                    {promptResponse.response}
                                  </p>
                                </div>
                              ) : (promptResponse.answeredBy === 'him' || promptResponse.answeredBy === 'her') && promptResponse.response2 ? (
                                <div className="space-y-3 md:space-y-4">
                                  <div className="bg-gradient-to-br from-gray-50/70 to-gray-100/70 p-3 md:p-4 rounded-xl md:rounded-2xl border border-gray-200/30">
                                    <h5 className="font-medium text-gray-900 mb-2 text-xs md:text-sm flex items-center">
                                      <span className={`w-2 h-2 rounded-full mr-2 ${getColorScheme()}`}></span>
                                      {promptResponse.answeredBy === 'him' ? getFirstNames().firstName : getFirstNames().secondName} answered:
                                    </h5>
                                    <p className="text-gray-700 leading-relaxed font-light text-sm">
                                      {promptResponse.response}
                                    </p>
                                  </div>
                                  <div className="bg-gradient-to-br from-gray-50/70 to-gray-100/70 p-3 md:p-4 rounded-xl md:rounded-2xl border border-gray-200/30">
                                    <h5 className="font-medium text-gray-900 mb-2 text-xs md:text-sm flex items-center">
                                      <span className="w-2 h-2 bg-pink-400 rounded-full mr-2"></span>
                                      {promptResponse.answeredBy === 'him' ? getFirstNames().secondName : getFirstNames().firstName} answered:
                                    </h5>
                                    <p className="text-gray-700 leading-relaxed font-light text-sm">
                                      {promptResponse.response2}
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-gradient-to-br from-gray-50/70 to-gray-100/70 p-3 md:p-4 rounded-xl md:rounded-2xl border border-gray-200/30">
                                  <h5 className="font-medium text-gray-900 mb-2 text-xs md:text-sm flex items-center">
                                    <span className={`w-2 h-2 rounded-full mr-2 ${getColorScheme()}`}></span>
                                    {promptResponse.answeredBy === 'him' ? getFirstNames().firstName : promptResponse.answeredBy === 'her' ? getFirstNames().secondName : 'They'} answered:
                                  </h5>
                                  <p className="text-gray-700 leading-relaxed font-light text-sm md:text-base">
                                    {promptResponse.response}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Card Footer - Dedicated media area for uniform height */}
                          <div className="h-48 md:h-60 border-t border-gray-100 flex items-center justify-center relative">
                            {promptResponse.photo ? (
                              <img
                                src={promptResponse.photo}
                                alt="Story photo"
                                className="w-full h-full object-cover absolute inset-0"
                                loading="lazy"
                              />
                            ) : (
                              <div className={`w-full h-full bg-gradient-to-br ${getLightColorScheme()} opacity-30 flex items-center justify-center`}>
                                <svg className="w-16 h-16 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          
                          {/* Story Number Badge - Centered at the bottom */}
                          <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br ${getColorScheme()} text-white rounded-xl md:rounded-2xl flex items-center justify-center text-sm md:text-lg font-semibold shadow-xl z-10 group-hover:scale-110 transition-transform duration-300`}>
                            {index + 1}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
                
                {/* Indicator dots */}
                <div className="flex justify-center mt-8 space-x-2">
                  {weddingData.promptResponses.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStoryIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentStoryIndex 
                          ? 'bg-rose-500 scale-125' 
                          : 'bg-rose-300 hover:bg-rose-400'
                      }`}
                      aria-label={`Go to story ${index + 1}`}
                    />
                  ))}
                </div>
                </div>
              ) : (
              // Fallback to legacy story content
              <div className="max-w-4xl mx-auto space-y-12">
                {weddingData.howWeMet && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl">
                    <h3 className="font-playfair text-3xl font-light text-gray-800 mb-6 tracking-wider">How We Met</h3>
                    <p className="text-xl text-gray-700 leading-relaxed font-light">{weddingData.howWeMet}</p>
                  </div>
                )}
                
                {weddingData.proposal && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl">
                    <h3 className="font-playfair text-3xl font-light text-gray-800 mb-6 tracking-wider">The Proposal</h3>
                    <p className="text-xl text-gray-700 leading-relaxed font-light">{weddingData.proposal}</p>
                  </div>
                )}
                
                {weddingData.story && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl">
                    <h3 className="font-playfair text-3xl font-light text-gray-800 mb-6 tracking-wider">Our Journey</h3>
                    <p className="text-xl text-gray-700 leading-relaxed font-light">{weddingData.story}</p>
                  </div>
                )}
                
                {weddingData.favoriteThings && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl">
                    <h3 className="font-playfair text-3xl font-light text-gray-800 mb-6 tracking-wider">Things We Love</h3>
                    <p className="text-xl text-gray-700 leading-relaxed font-light">{weddingData.favoriteThings}</p>
                  </div>
                )}
              </div>
            )}
            </div>
          </div>
        </section>
      )}

      {/* Details Section */}
      <section id="details" className="relative min-h-screen flex items-center bg-gradient-to-br from-gray-50 to-white">
        {/* Background Image */}
        <div className="absolute inset-0 opacity-15">
          <div className="relative w-full h-full">
            <img
              src={weddingData.photos[2] || weddingData.photos[1] || weddingData.photos[0]}
              alt="Venue details"
              className="w-full h-full object-cover object-center"
              style={{
                transform: `translateY(${scrollY * 0.1}px) scale(1.01)`,
                transition: 'transform 0.1s ease-out'
              }}
              loading="lazy"
            />
          </div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 py-12 md:py-24">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-8 md:mb-16">
              <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-light text-gray-900 mb-4 md:mb-8 tracking-wider">
                The Details
              </h2>
              <div className={`w-16 md:w-24 h-px bg-gradient-to-r ${getColorScheme()} mx-auto`} />
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8 md:gap-16">
              {/* Left Column */}
              <div className="space-y-6 md:space-y-12">
                {/* When */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xl border border-gray-200/50">
                  <div className="flex items-center mb-4 md:mb-6">
                    <div className={`w-8 h-8 md:w-12 md:h-12 bg-gradient-to-r ${getColorScheme()} rounded-xl md:rounded-2xl flex items-center justify-center mr-3 md:mr-4`}>
                      <svg className="w-4 h-4 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="font-playfair text-xl md:text-3xl font-light text-gray-800 tracking-wider">When</h3>
                  </div>
                  <p className="text-lg md:text-2xl text-gray-700 font-light mb-2 md:mb-4">{formatDate(weddingData.weddingDate)}</p>
                  {weddingData.ceremonyTime && (
                    <p className="text-sm md:text-lg text-gray-600 font-light">Ceremony: {weddingData.ceremonyTime}</p>
                  )}
                  {weddingData.receptionTime && (
                    <p className="text-sm md:text-lg text-gray-600 font-light">Reception: {weddingData.receptionTime}</p>
                  )}
                </div>
                
                {/* Where */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xl border border-gray-200/50">
                  <div className="flex items-center mb-4 md:mb-6">
                    <div className={`w-8 h-8 md:w-12 md:h-12 bg-gradient-to-r ${getColorScheme()} rounded-xl md:rounded-2xl flex items-center justify-center mr-3 md:mr-4`}>
                      <svg className="w-4 h-4 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
            </div>
                    <h3 className="font-playfair text-xl md:text-3xl font-light text-gray-800 tracking-wider">Where</h3>
                  </div>
                  <p className="text-lg md:text-2xl text-gray-700 font-light mb-2 md:mb-4">{weddingData.venue}</p>
                  {weddingData.venueAddress && (
                    <p className="text-sm md:text-lg text-gray-600 font-light">
                      {weddingData.venueAddress}, {weddingData.venueCity}, {weddingData.venueState}
                    </p>
                  )}
                  </div>
                </div>
              
              {/* Right Column */}
              <div className="space-y-6 md:space-y-12">
                {/* Dress Code */}
                {weddingData.dressCode && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xl border border-gray-200/50">
                    <div className="flex items-center mb-4 md:mb-6">
                      <div className={`w-8 h-8 md:w-12 md:h-12 bg-gradient-to-r ${getColorScheme()} rounded-xl md:rounded-2xl flex items-center justify-center mr-3 md:mr-4`}>
                        <svg className="w-4 h-4 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h3 className="font-playfair text-xl md:text-3xl font-light text-gray-800 tracking-wider">Dress Code</h3>
                    </div>
                    <p className="text-lg md:text-xl text-gray-700 font-light">{weddingData.dressCode}</p>
                  </div>
                )}
                
                {/* Accommodation */}
                {weddingData.accommodationInfo && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xl border border-gray-200/50">
                    <div className="flex items-center mb-4 md:mb-6">
                      <div className={`w-8 h-8 md:w-12 md:h-12 bg-gradient-to-r ${getColorScheme()} rounded-xl md:rounded-2xl flex items-center justify-center mr-3 md:mr-4`}>
                        <svg className="w-4 h-4 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                        </svg>
                      </div>
                      <h3 className="font-playfair text-xl md:text-3xl font-light text-gray-800 tracking-wider">Accommodation</h3>
                    </div>
                    <p className="text-sm md:text-lg text-gray-700 font-light">{weddingData.accommodationInfo}</p>
                  </div>
                )}
                
                {/* Transportation */}
                {weddingData.transportationInfo && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xl border border-gray-200/50">
                    <div className="flex items-center mb-4 md:mb-6">
                      <div className={`w-8 h-8 md:w-12 md:h-12 bg-gradient-to-r ${getColorScheme()} rounded-xl md:rounded-2xl flex items-center justify-center mr-3 md:mr-4`}>
                        <svg className="w-4 h-4 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
              </div>
                      <h3 className="font-playfair text-xl md:text-3xl font-light text-gray-800 tracking-wider">Transportation</h3>
                  </div>
                    <p className="text-sm md:text-lg text-gray-700 font-light">{weddingData.transportationInfo}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

                    {/* Photos Section */}
      {weddingData.photos && weddingData.photos.length > 0 && (
        <section id="photos" className="relative min-h-screen flex items-center bg-gradient-to-br from-gray-900 to-black">
          {/* Content */}
          <div className="relative z-10 container mx-auto px-4 sm:px-6 py-12 md:py-24">
            <div className="max-w-7xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-8 md:mb-16">
                <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-light text-white mb-4 md:mb-8 tracking-wider">
                  Our Photos
                </h2>
                <div className={`w-16 md:w-24 h-px bg-gradient-to-r ${getColorScheme()} mx-auto`} />
              </div>
              
              {/* Horizontal Carousel with Navigation */}
              <div className="relative">
                {/* Navigation Arrows */}
                <button
                  onClick={() => {
                    const container = document.getElementById('photos-carousel');
                    if (container) {
                      container.scrollBy({ left: -350, behavior: 'smooth' });
                    }
                  }}
                  className="absolute left-2 md:left-[-20px] top-1/2 transform -translate-y-1/2 bg-white/50 hover:bg-white/80 text-gray-600 hover:text-gray-900 rounded-full p-2 md:p-3 shadow-md transition-all duration-300 z-20 flex items-center justify-center"
                  style={{ width: '40px', height: '40px' }}
                  aria-label="Previous photo"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button
                  onClick={() => {
                    const container = document.getElementById('photos-carousel');
                    if (container) {
                      container.scrollBy({ left: 350, behavior: 'smooth' });
                    }
                  }}
                  className="absolute right-2 md:right-[-20px] top-1/2 transform -translate-y-1/2 bg-white/50 hover:bg-white/80 text-gray-600 hover:text-gray-900 rounded-full p-2 md:p-3 shadow-md transition-all duration-300 z-20 flex items-center justify-center"
                  style={{ width: '40px', height: '40px' }}
                  aria-label="Next photo"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <div id="photos-carousel" className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:gap-8 pb-8 -mx-4 sm:-mx-6 px-4 sm:px-6">
                  {/* Duplicate photos for infinite scroll effect */}
                  {[...weddingData.photos, ...weddingData.photos, ...weddingData.photos].map((photo, index) => (
                    <div
                      key={index}
                      className="group relative flex-shrink-0 w-80 sm:w-96 h-[400px] sm:h-[500px] snap-center"
                    >
                      <div className="w-full h-full rounded-2xl md:rounded-3xl overflow-hidden shadow-xl md:shadow-2xl hover:shadow-2xl md:hover:shadow-3xl transition-all duration-500 hover:scale-105 transform-gpu">
                        <div className="relative w-full h-full">
                          <img
                            src={photo}
                            alt={`Photo ${(index % weddingData.photos.length) + 1}`}
                            className="w-full h-full object-cover object-center"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Scroll indicator */}
                <div className="flex justify-center mt-8 md:mt-12 space-x-2 md:space-x-3">
                  {weddingData.photos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        const container = document.getElementById('photos-carousel');
                        if (container) {
                          container.scrollTo({ 
                            left: (container.scrollWidth / (weddingData.photos.length * 3)) * (index + weddingData.photos.length),
                            behavior: 'smooth'
                          });
                        }
                      }}
                      className="w-2 h-2 md:w-3 md:h-3 bg-rose-300 rounded-full opacity-50 transition-all duration-300 hover:opacity-100 hover:scale-125"
                      aria-label={`Go to photo ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* RSVP Section */}
      <section id="rsvp" className={`relative min-h-screen flex items-center bg-gradient-to-br ${getLightColorScheme()}`}>
        <div className="relative z-10 container mx-auto px-4 sm:px-6 py-12 md:py-24">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8 md:mb-16">
              <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-light text-gray-900 mb-4 md:mb-8 tracking-wider">
                RSVP
              </h2>
              <div className={`w-16 md:w-24 h-px bg-gradient-to-r ${getColorScheme()} mx-auto`} />
              <p className="text-base sm:text-lg md:text-xl text-gray-600 mt-4 md:mt-8 max-w-3xl mx-auto leading-relaxed font-light px-4">
                Your presence is the final piece that will make our celebration complete.
              </p>
            </div>
            
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-xl border border-gray-200/50 p-6 md:p-8 mb-8 md:mb-12">
              <h3 className="font-playfair text-xl md:text-2xl font-light text-gray-800 mb-4 md:mb-6 tracking-wider">Find Your Name</h3>
              <p className="text-gray-600 mb-4">Please verify your name on our guest list before proceeding.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Enter your full name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-3 md:py-4 border border-gray-300 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none transition-all duration-300"
                />
                <button
                  onClick={searchGuest}
                  className={`px-6 py-3 md:py-4 bg-gradient-to-r ${getColorScheme()} text-white rounded-xl md:rounded-2xl font-medium hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl`}
                >
                  Verify
                </button>
              </div>
              
              {foundGuest && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl md:rounded-2xl">
                  <p className="text-green-800 font-medium">Welcome, {foundGuest.name}! You're on our guest list.</p>
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => setShowRSVP(true)}
                      className={`px-6 py-3 bg-gradient-to-r ${getColorScheme()} text-white rounded-xl font-medium hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl`}
                    >
                      Continue to RSVP Form
                    </button>
                  </div>
                </div>
              )}
              
              {searchTerm && !foundGuest && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl md:rounded-2xl">
                  <p className="text-amber-800">
                    We couldn't find your name on our guest list. Please make sure you're entering your full name exactly as it appears on your invitation.
                  </p>
                  <div className="mt-4 text-center">
                    <p className="text-gray-600 mb-2">If you believe this is an error, please contact the couple.</p>
                  </div>
                </div>
              )}
            </div>
            
            {foundGuest && showRSVP && !rsvpSubmitted && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-xl border border-gray-200/50 p-6 md:p-8">
                <h3 className="font-playfair text-xl md:text-2xl font-light text-gray-800 mb-6 md:mb-8 tracking-wider">RSVP Form</h3>
                <form onSubmit={handleRSVPSubmit} className="space-y-6 md:space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div>
                      <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        value={rsvpData.guestName}
                        onChange={(e) => setRsvpData({...rsvpData, guestName: e.target.value})}
                        className="w-full px-4 py-3 md:py-4 border border-gray-300 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none transition-all duration-300"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={rsvpData.email}
                        onChange={(e) => setRsvpData({...rsvpData, email: e.target.value})}
                        className="w-full px-4 py-3 md:py-4 border border-gray-300 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none transition-all duration-300"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">Will you be attending?</label>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="attending"
                          checked={rsvpData.attending}
                          onChange={() => setRsvpData({...rsvpData, attending: true})}
                          className="mr-2 text-rose-400 focus:ring-rose-400"
                        />
                        <span className="text-sm md:text-base text-gray-700">Yes, I will attend</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="attending"
                          checked={!rsvpData.attending}
                          onChange={() => setRsvpData({...rsvpData, attending: false})}
                          className="mr-2 text-rose-400 focus:ring-rose-400"
                        />
                        <span className="text-sm md:text-base text-gray-700">No, I cannot attend</span>
                      </label>
                    </div>
                  </div>
                  
                  {rsvpData.attending && (
                    <>
                      <div>
                        <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">Will you bring a plus one?</label>
                        <div className="flex flex-col sm:flex-row gap-4 mb-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="plusOne"
                              checked={rsvpData.numberOfGuests > 1}
                              onChange={() => setRsvpData({...rsvpData, numberOfGuests: 2})}
                              className="mr-2 text-rose-400 focus:ring-rose-400"
                            />
                            <span className="text-sm md:text-base text-gray-700">Yes, I'll bring a guest</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="plusOne"
                              checked={rsvpData.numberOfGuests === 1}
                              onChange={() => setRsvpData({...rsvpData, numberOfGuests: 1})}
                              className="mr-2 text-rose-400 focus:ring-rose-400"
                            />
                            <span className="text-sm md:text-base text-gray-700">No, just me</span>
                          </label>
                        </div>
                        
                        {rsvpData.numberOfGuests > 1 && (
                          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                            <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">Guest's Name</label>
                            <input
                              type="text"
                              placeholder="Enter your guest's name"
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none transition-all duration-300"
                            />
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">Dietary Restrictions</label>
                        <textarea
                          value={rsvpData.dietaryRestrictions}
                          onChange={(e) => setRsvpData({...rsvpData, dietaryRestrictions: e.target.value})}
                          className="w-full px-4 py-3 md:py-4 border border-gray-300 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none transition-all duration-300 resize-none"
                          rows={3}
                          placeholder="Any dietary restrictions or allergies for you or your guest..."
                        />
                      </div>
                    </>
                  )}
                  
                  <button
                    type="submit"
                    className={`w-full py-4 md:py-6 bg-gradient-to-r ${getColorScheme()} text-white rounded-xl md:rounded-2xl font-medium text-lg md:text-xl hover:opacity-90 transition-all duration-300 shadow-xl hover:shadow-2xl`}
                  >
                    Submit RSVP
                  </button>
                </form>
              </div>
            )}
            
            {rsvpSubmitted && (
              <div className="bg-green-50 border border-green-200 rounded-2xl md:rounded-3xl p-6 md:p-8 text-center">
                <h3 className="font-playfair text-xl md:text-2xl font-light text-green-800 mb-4">Thank You!</h3>
                {rsvpData.attending ? (
                  <div>
                    <p className="text-green-700 mb-4">Your RSVP has been submitted successfully. We look forward to celebrating with you{rsvpData.numberOfGuests > 1 ? ' and your guest' : ''}!</p>
                    <div className="mt-6 p-4 bg-white/80 rounded-xl border border-green-100 max-w-md mx-auto">
                      <h4 className="font-medium text-gray-800 mb-2">Your RSVP Details:</h4>
                      <ul className="text-left text-gray-700 space-y-2">
                        <li><span className="font-medium">Name:</span> {foundGuest?.name}</li>
                        {rsvpData.numberOfGuests > 1 && (
                          <li><span className="font-medium">Guest:</span> {(document.querySelector('input[placeholder="Enter your guest\'s name"]') as HTMLInputElement)?.value || "Guest"}</li>
                        )}
                        <li><span className="font-medium">Email:</span> {rsvpData.email}</li>
                        {rsvpData.dietaryRestrictions && (
                          <li><span className="font-medium">Dietary Notes:</span> {rsvpData.dietaryRestrictions}</li>
                        )}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p className="text-green-700">Thank you for letting us know you won't be able to attend. We'll miss you, but we appreciate your response!</p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="relative bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="relative w-full h-full">
            <img
              src={weddingData.photos[4] || weddingData.photos[0]}
              alt="Footer background"
              className="w-full h-full object-cover object-center"
              loading="lazy"
            />
          </div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 sm:px-6 py-12 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-playfair text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-light mb-4 md:mb-8 tracking-wider">
              We Can't Wait to Celebrate With You
            </h2>
            <div className={`w-16 md:w-32 h-px bg-gradient-to-r ${getColorScheme()} mx-auto mb-4 md:mb-8`} />
            <p className="text-base sm:text-lg md:text-xl text-gray-300 font-light mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed px-4">
              Thank you for being part of our special day. Your love and support mean the world to us.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-8 md:mt-16">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-8 border border-white/20">
                <div className={`w-8 h-8 md:w-12 md:h-12 bg-gradient-to-r ${getColorScheme()} rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4`}>
                  <svg className="w-4 h-4 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="font-playfair text-lg md:text-2xl font-light mb-2 md:mb-4 tracking-wider">Venue</h3>
                <p className="text-gray-300 font-light text-sm md:text-base">{weddingData.venue}</p>
                {weddingData.venueAddress && (
                  <p className="text-gray-400 font-light text-xs md:text-sm mt-1 md:mt-2">
                    {weddingData.venueAddress}, {weddingData.venueCity}, {weddingData.venueState}
                  </p>
                )}
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-8 border border-white/20">
                <div className={`w-8 h-8 md:w-12 md:h-12 bg-gradient-to-r ${getColorScheme()} rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4`}>
                  <svg className="w-4 h-4 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-playfair text-lg md:text-2xl font-light mb-2 md:mb-4 tracking-wider">Date & Time</h3>
                <p className="text-gray-300 font-light text-sm md:text-base">{formatDate(weddingData.weddingDate)}</p>
                {weddingData.ceremonyTime && (
                  <p className="text-gray-400 font-light text-xs md:text-sm mt-1 md:mt-2">
                    Ceremony: {weddingData.ceremonyTime}
                  </p>
                )}
                {weddingData.receptionTime && (
                  <p className="text-gray-400 font-light text-xs md:text-sm">
                    Reception: {weddingData.receptionTime}
                  </p>
                )}
              </div>
            </div>
            
            {/* Simplified Social Sharing Box */}
            <div className="mt-8 md:mt-12 mb-4 md:mb-8 flex justify-center">
              <div className="inline-flex items-center gap-4 md:gap-6 bg-white/10 backdrop-blur-sm rounded-full px-4 py-3 border border-white/20">
                <span className="text-white/90 text-sm md:text-base font-light">Share:</span>
                
                {/* QR Code Button */}
                <button 
                  onClick={() => setShowShareModal(true)}
                  className="p-2 text-white/80 hover:text-white transition-colors duration-300 rounded-full hover:bg-white/10 flex items-center gap-2"
                  aria-label="Show QR Code"
                  title="Show QR Code"
                >
                  <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 11V3H11V11H3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 21V13H11V21H3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M13 3H21V11H13V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M13 13H17V17H13V13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17 17H21V21H17V17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M13 17V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="hidden md:inline">QR Code</span>
                </button>
                
                {/* WhatsApp Button */}
                <a 
                  href={`https://wa.me/?text=${encodeURIComponent(`Join us for ${weddingData.coupleNames}'s wedding on ${formatDate(weddingData.weddingDate)}! ${window.location.href}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-white/80 hover:text-white transition-colors duration-300 rounded-full hover:bg-white/10 flex items-center gap-2"
                  aria-label="Share on WhatsApp"
                  title="Share on WhatsApp"
                >
                  <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12C2 13.86 2.49 15.59 3.32 17.06L2 22L7.03 20.7C8.46 21.45 10.17 21.9 12 21.9C17.52 21.9 22 17.42 22 11.9C22 6.38 17.52 2 12 2ZM12 20C10.42 20 8.93 19.58 7.65 18.82L7.12 18.5L4.47 19.29L5.27 16.7L4.92 16.15C4.09 14.83 3.62 13.28 3.62 11.6C3.62 7.21 7.33 3.6 11.72 3.6C16.11 3.6 19.82 7.21 19.82 11.6C19.82 15.99 16.21 20 12 20ZM16.5 14.5C16.28 14.39 15.08 13.81 14.88 13.74C14.68 13.67 14.53 13.63 14.38 13.85C14.23 14.07 13.77 14.61 13.65 14.76C13.53 14.91 13.4 14.93 13.18 14.82C12.96 14.71 12.19 14.47 11.27 13.67C10.55 13.04 10.08 12.25 9.95 12.03C9.83 11.81 9.94 11.7 10.05 11.59C10.15 11.49 10.27 11.33 10.38 11.21C10.49 11.09 10.52 11 10.6 10.85C10.67 10.7 10.64 10.58 10.58 10.47C10.52 10.36 10.06 9.16 9.87 8.72C9.69 8.29 9.5 8.35 9.37 8.34C9.25 8.33 9.1 8.33 8.95 8.33C8.8 8.33 8.56 8.39 8.36 8.61C8.16 8.83 7.53 9.42 7.53 10.62C7.53 11.82 8.4 12.97 8.51 13.12C8.62 13.27 10.05 15.47 12.23 16.5C12.83 16.76 13.3 16.92 13.66 17.03C14.25 17.22 14.79 17.19 15.22 17.13C15.7 17.06 16.69 16.55 16.89 16.02C17.09 15.49 17.09 15.05 17.03 14.95C16.97 14.85 16.82 14.79 16.6 14.68L16.5 14.5Z" fill="currentColor"/>
                  </svg>
                  <span className="hidden md:inline">WhatsApp</span>
                </a>
                
                {/* Native Share Button */}
                <button 
                  onClick={() => {
                    const shareText = `Join us for ${weddingData.coupleNames}'s wedding on ${formatDate(weddingData.weddingDate)}!`;
                    const shareUrl = window.location.href;
                    
                    if (navigator.share) {
                      navigator.share({
                        title: `${weddingData.coupleNames}'s Wedding`,
                        text: shareText,
                        url: shareUrl,
                      });
                    } else {
                      // Fallback to copying to clipboard
                      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
                      alert('Link copied to clipboard!');
                    }
                  }}
                  className="p-2 text-white/80 hover:text-white transition-colors duration-300 rounded-full hover:bg-white/10 flex items-center gap-2"
                  aria-label="Share"
                  title="Share"
                >
                  <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 6.65685 16.3431 8 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6 15C7.65685 15 9 13.6569 9 12C9 10.3431 7.65685 9 6 9C4.34315 9 3 10.3431 3 12C3 13.6569 4.34315 15 6 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18 22C19.6569 22 21 20.6569 21 19C21 17.3431 19.6569 16 18 16C16.3431 16 15 17.3431 15 19C15 20.6569 16.3431 22 18 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8.59 13.51L15.42 17.49" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M15.41 6.51L8.59 10.49" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="hidden md:inline">Share</span>
                </button>
              </div>
            </div>

            {/* Registry and Additional Info Links */}
            <div className="mt-8 md:mt-12 mb-8 md:mb-12">
              <h3 className="font-playfair text-xl md:text-2xl font-light text-white mb-4 md:mb-6 tracking-wider text-center">
                Additional Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {/* Registry */}
                <a 
                  href="#registry" 
                  data-section="registry"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Registry links will be added soon!");
                  }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/20 transition-all duration-300 border border-white/20 group"
                >
                  <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-white mb-1">Registry</h4>
                  <p className="text-white/70 text-sm">View our gift registry</p>
                </a>
                
                {/* Accommodations */}
                <a 
                  href="#accommodations" 
                  data-section="accommodations"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Accommodation information will be added soon!");
                  }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/20 transition-all duration-300 border border-white/20 group"
                >
                  <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-white mb-1">Accommodations</h4>
                  <p className="text-white/70 text-sm">Where to stay</p>
                </a>
                
                {/* Travel Info */}
                <a 
                  href="#travel" 
                  data-section="travel"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Travel information will be added soon!");
                  }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/20 transition-all duration-300 border border-white/20 group"
                >
                  <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-white mb-1">Travel Info</h4>
                  <p className="text-white/70 text-sm">How to get here</p>
                </a>
                
                {/* Things to Do */}
                <a 
                  href="#activities" 
                  data-section="activities"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Local activities information will be added soon!");
                  }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/20 transition-all duration-300 border border-white/20 group"
                >
                  <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-white mb-1">Things to Do</h4>
                  <p className="text-white/70 text-sm">Local activities</p>
                </a>
              </div>
            </div>
            
            {/* Footer */}
            <div className="mt-8 md:mt-16 pt-6 md:pt-8 border-t border-white/20">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-gray-400 font-light text-sm md:text-base">
                  © {new Date().getFullYear()} {weddingData.coupleNames}. Made with ❤️ for our special day.
                </p>
                
                {/* Made with Bind8 */}
                <div className="flex items-center gap-2 text-gray-400 font-light text-sm md:text-base">
                  <span>Made with</span>
                  <a 
                    href="https://bind8.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-white transition-colors duration-300 group"
                  >
                    <Logo size="sm" className="text-white" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* QR Code Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl md:rounded-3xl max-w-md w-full">
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-playfair text-xl md:text-2xl font-light text-gray-800">Share Wedding Website</h3>
                <button 
                  onClick={() => setShowShareModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* QR Code */}
              <div className="mb-6 flex flex-col items-center">
                <div 
                  ref={shareImageRef}
                  className={`p-4 bg-white rounded-xl shadow-md border border-gray-200`}
                >
                  {/* QR Code SVG - this is a simplified version, in production you'd use a library */}
                  <div className="w-64 h-64 mx-auto relative">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(window.location.href)}&bgcolor=FFFFFF&color=000000`}
                      alt="QR Code for wedding website"
                      className="w-full h-full object-contain"
                    />
                    {/* Couple's initials in the center */}
                    <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-r ${getColorScheme()} flex items-center justify-center shadow-lg`}>
                      <span className="text-white font-medium text-lg">
                        {getFirstNames().firstName.charAt(0)}
                        {getFirstNames().secondName ? `+${getFirstNames().secondName.charAt(0)}` : ''}
                      </span>
                    </div>
                  </div>
                  <div className="text-center mt-4">
                    <p className="font-playfair text-lg font-light text-gray-800">
                      {weddingData.coupleNames}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatDate(weddingData.weddingDate)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-600 text-sm text-center">
                  Take a screenshot of this QR code to share with your guests!
                </p>
                
                <div className="flex justify-between">
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: `${weddingData.coupleNames}'s Wedding`,
                          text: `Join us for ${weddingData.coupleNames}'s wedding on ${formatDate(weddingData.weddingDate)}!`,
                          url: window.location.href,
                        });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Link copied to clipboard!');
                      }
                    }}
                    className={`px-4 py-2 bg-gradient-to-r ${getColorScheme()} text-white rounded-lg font-medium hover:opacity-90 transition-all duration-300`}
                  >
                    Share Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
