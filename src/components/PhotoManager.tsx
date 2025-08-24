'use client';

import { useState } from 'react';
import { uploadImage, uploadMultipleImages } from '@/lib/supabaseClient';

interface PhotoManagerProps {
  weddingData: any;
  weddingId: string;
  onSave: (updatedData: any) => void;
}

export default function PhotoManager({ weddingData, weddingId, onSave }: PhotoManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [heroPhoto, setHeroPhoto] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState<string | null>(weddingData?.heroPhoto || null);
  const [couplePhoto, setCouplePhoto] = useState<File | null>(null);
  const [couplePreview, setCouplePreview] = useState<string | null>(weddingData?.couplePhoto || null);
  const [galleryPhotos, setGalleryPhotos] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>(weddingData?.photos || []);

  const handleHeroPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setHeroPhoto(file);
      setHeroPreview(URL.createObjectURL(file));
    }
  };

  const handleCouplePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCouplePhoto(file);
      setCouplePreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setGalleryPhotos(prev => [...prev, ...files]);

      // Generate previews
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setGalleryPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeGalleryPhoto = (index: number) => {
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
    
    // If this is a newly added photo
    if (index >= (weddingData.photos?.length || 0)) {
      const adjustedIndex = index - (weddingData.photos?.length || 0);
      setGalleryPhotos(prev => prev.filter((_, i) => i !== adjustedIndex));
    }
  };

  const handleSave = async () => {
    setIsUploading(true);
    setUploadStatus('Uploading photos...');

    try {
      let updatedData = { ...weddingData };
      let hasChanges = false;

      // Upload hero photo if changed
      if (heroPhoto) {
        try {
          const heroPhotoUrl = await uploadImage(heroPhoto, weddingId, 'hero');
          updatedData.heroPhoto = heroPhotoUrl;
          hasChanges = true;
        } catch (error) {
          console.error('Failed to upload hero photo:', error);
          setUploadStatus('Failed to upload hero photo. Please try again.');
          setIsUploading(false);
          return;
        }
      }

      // Upload couple photo if changed
      if (couplePhoto) {
        try {
          const couplePhotoUrl = await uploadImage(couplePhoto, weddingId, 'couple');
          updatedData.couplePhoto = couplePhotoUrl;
          hasChanges = true;
        } catch (error) {
          console.error('Failed to upload couple photo:', error);
          setUploadStatus('Failed to upload couple photo. Please try again.');
          setIsUploading(false);
          return;
        }
      }

      // Upload new gallery photos if any
      if (galleryPhotos.length > 0) {
        try {
          const newPhotoUrls = await uploadMultipleImages(galleryPhotos, weddingId);
          updatedData.photos = [...(updatedData.photos || []), ...newPhotoUrls];
          hasChanges = true;
        } catch (error) {
          console.error('Failed to upload gallery photos:', error);
          setUploadStatus('Failed to upload gallery photos. Please try again.');
          setIsUploading(false);
          return;
        }
      }

      // Save changes if there were any uploads
      if (hasChanges) {
        onSave(updatedData);
        setUploadStatus('Photos updated successfully!');
      } else {
        setUploadStatus('No changes to save.');
      }
    } catch (error) {
      console.error('Error saving photos:', error);
      setUploadStatus('An error occurred. Please try again.');
    } finally {
      setIsUploading(false);
      
      // Clear status message after a delay
      setTimeout(() => {
        setUploadStatus('');
      }, 3000);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
        <h2 className="text-xl font-medium text-gray-900 mb-6">Photo Management</h2>
        
        {/* Hero Photo */}
        <div className="mb-8">
          <h3 className="font-medium text-gray-900 mb-4">Hero Photo</h3>
          <p className="text-gray-600 text-sm mb-4">
            This is the main background image of your wedding website.
          </p>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            {heroPreview ? (
              <div className="space-y-4">
                <img
                  src={heroPreview}
                  alt="Hero Preview"
                  className="w-full h-40 object-cover rounded-lg"
                />
                <div className="flex justify-center gap-4">
                  <label
                    htmlFor="hero-photo"
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
                  >
                    Replace Photo
                    <input
                      type="file"
                      id="hero-photo"
                      accept="image/*"
                      onChange={handleHeroPhotoChange}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={() => {
                      setHeroPhoto(null);
                      setHeroPreview(null);
                    }}
                    className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-4xl mb-4">🌄</div>
                <p className="text-gray-600 mb-4">Add a hero image for your wedding website</p>
                <label
                  htmlFor="hero-photo"
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  Upload Hero Photo
                  <input
                    type="file"
                    id="hero-photo"
                    accept="image/*"
                    onChange={handleHeroPhotoChange}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </div>
        
        {/* Couple Photo */}
        <div className="mb-8">
          <h3 className="font-medium text-gray-900 mb-4">Couple Photo</h3>
          <p className="text-gray-600 text-sm mb-4">
            This photo will be featured prominently on your wedding website.
          </p>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            {couplePreview ? (
              <div className="space-y-4">
                <img
                  src={couplePreview}
                  alt="Couple Preview"
                  className="w-full h-40 object-cover rounded-lg"
                />
                <div className="flex justify-center gap-4">
                  <label
                    htmlFor="couple-photo"
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
                  >
                    Replace Photo
                    <input
                      type="file"
                      id="couple-photo"
                      accept="image/*"
                      onChange={handleCouplePhotoChange}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={() => {
                      setCouplePhoto(null);
                      setCouplePreview(null);
                    }}
                    className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-4xl mb-4">👫</div>
                <p className="text-gray-600 mb-4">Add a photo of the happy couple</p>
                <label
                  htmlFor="couple-photo"
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  Upload Couple Photo
                  <input
                    type="file"
                    id="couple-photo"
                    accept="image/*"
                    onChange={handleCouplePhotoChange}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </div>
        
        {/* Gallery Photos */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-900">Gallery Photos</h3>
            <label
              htmlFor="gallery-photos"
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              Add Photos
              <input
                type="file"
                id="gallery-photos"
                accept="image/*"
                multiple
                onChange={handleGalleryPhotoChange}
                className="hidden"
              />
            </label>
          </div>
          
          {galleryPreviews.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {galleryPreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-lg">
                    <button
                      onClick={() => removeGalleryPhoto(index)}
                      className="bg-white text-red-600 p-2 rounded-full hover:bg-red-50"
                      title="Remove photo"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="text-4xl mb-4">📸</div>
              <p className="text-gray-600 mb-4">No gallery photos added yet</p>
              <label
                htmlFor="gallery-photos-empty"
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                Upload Photos
                <input
                  type="file"
                  id="gallery-photos-empty"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryPhotoChange}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>
      </div>
      
      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isUploading}
          className={`px-6 py-3 rounded-lg font-medium ${
            isUploading
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}
        >
          {isUploading ? 'Uploading...' : 'Save Photos'}
        </button>
      </div>
      
      {/* Upload Status */}
      {uploadStatus && (
        <div className={`mt-4 p-4 rounded-lg ${
          uploadStatus.includes('Failed') || uploadStatus.includes('error')
            ? 'bg-red-50 border border-red-200 text-red-700' 
            : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
        }`}>
          {uploadStatus}
        </div>
      )}
    </div>
  );
}
