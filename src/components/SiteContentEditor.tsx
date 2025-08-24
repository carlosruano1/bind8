'use client';

import { useState, useEffect } from 'react';

interface PromptResponse {
  prompt: string;
  response: string;
  response2?: string;
  photo: string | null;
  photoPreview: string | null;
  answeredBy?: 'both' | 'him' | 'her';
}

interface ContentEditorProps {
  weddingData: any;
  onSave: (updatedData: any) => void;
}

export default function SiteContentEditor({ weddingData, onSave }: ContentEditorProps) {
  const [formData, setFormData] = useState({
    coupleNames: '',
    weddingDate: '',
    venue: '',
    venueAddress: '',
    venueCity: '',
    venueState: '',
    venueZip: '',
    ceremonyTime: '',
    receptionTime: '',
    dressCode: '',
    theme: '',
    colorScheme: '',
    howWeMet: '',
    promptResponses: [] as PromptResponse[],
    registryLinks: [] as string[],
    accommodationInfo: '',
    transportationInfo: '',
    specialInstructions: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (weddingData) {
      setFormData({
        coupleNames: weddingData.coupleNames || '',
        weddingDate: weddingData.weddingDate || '',
        venue: weddingData.venue || '',
        venueAddress: weddingData.venueAddress || '',
        venueCity: weddingData.venueCity || '',
        venueState: weddingData.venueState || '',
        venueZip: weddingData.venueZip || '',
        ceremonyTime: weddingData.ceremonyTime || '',
        receptionTime: weddingData.receptionTime || '',
        dressCode: weddingData.dressCode || '',
        theme: weddingData.theme || '',
        colorScheme: weddingData.colorScheme || '',
        howWeMet: weddingData.howWeMet || '',
        promptResponses: weddingData.promptResponses || [],
        registryLinks: weddingData.registryLinks || [],
        accommodationInfo: weddingData.accommodationInfo || '',
        transportationInfo: weddingData.transportationInfo || '',
        specialInstructions: weddingData.specialInstructions || '',
      });
    }
  }, [weddingData]);

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');

    try {
      const updatedData = {
        ...weddingData,
        ...formData,
      };

      // Save the updated data
      onSave(updatedData);
      
      setSaveMessage('Content updated successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving content:', error);
      setSaveMessage('Error saving content. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit}>
        {/* Basic Information Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-medium text-gray-900 mb-6">Basic Information</h2>
          
          <div className="grid gap-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Couple Names
                </label>
                <input
                  type="text"
                  value={formData.coupleNames}
                  onChange={(e) => handleChange('coupleNames', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wedding Date
                </label>
                <input
                  type="date"
                  value={formData.weddingDate}
                  onChange={(e) => handleChange('weddingDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Venue Name
              </label>
              <input
                type="text"
                value={formData.venue}
                onChange={(e) => handleChange('venue', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.venueAddress}
                  onChange={(e) => handleChange('venueAddress', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formData.venueCity}
                  onChange={(e) => handleChange('venueCity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={formData.venueState}
                  onChange={(e) => handleChange('venueState', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ceremony Time
                </label>
                <input
                  type="time"
                  value={formData.ceremonyTime}
                  onChange={(e) => handleChange('ceremonyTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reception Time
                </label>
                <input
                  type="time"
                  value={formData.receptionTime}
                  onChange={(e) => handleChange('receptionTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dress Code
              </label>
              <select
                value={formData.dressCode}
                onChange={(e) => handleChange('dressCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
          </div>
        </div>
        
        {/* Our Story Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-medium text-gray-900 mb-6">Our Story</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                How We Met
              </label>
              <textarea
                value={formData.howWeMet}
                onChange={(e) => handleChange('howWeMet', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              ></textarea>
            </div>
            
            {/* Prompt Responses */}
            {formData.promptResponses.map((promptResponse, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3">{promptResponse.prompt}</h3>
                
                {promptResponse.answeredBy === 'both' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Response
                    </label>
                    <textarea
                      value={promptResponse.response}
                      onChange={(e) => {
                        const updatedResponses = [...formData.promptResponses];
                        updatedResponses[index].response = e.target.value;
                        handleChange('promptResponses', updatedResponses);
                      }}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    ></textarea>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {promptResponse.answeredBy === 'him' ? 'His' : 'Her'} Response
                      </label>
                      <textarea
                        value={promptResponse.response}
                        onChange={(e) => {
                          const updatedResponses = [...formData.promptResponses];
                          updatedResponses[index].response = e.target.value;
                          handleChange('promptResponses', updatedResponses);
                        }}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      ></textarea>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {promptResponse.answeredBy === 'him' ? 'Her' : 'His'} Response
                      </label>
                      <textarea
                        value={promptResponse.response2 || ''}
                        onChange={(e) => {
                          const updatedResponses = [...formData.promptResponses];
                          updatedResponses[index].response2 = e.target.value;
                          handleChange('promptResponses', updatedResponses);
                        }}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      ></textarea>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Additional Information Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-medium text-gray-900 mb-6">Additional Information</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registry Links
              </label>
              <textarea
                value={formData.registryLinks.join('\n')}
                onChange={(e) => handleChange('registryLinks', e.target.value.split('\n').filter(link => link.trim()))}
                placeholder="Add your registry links (one per line)&#10;e.g., https://www.amazon.com/wedding/registry/...&#10;https://www.target.com/gift-registry/..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Accommodation Information
              </label>
              <textarea
                value={formData.accommodationInfo}
                onChange={(e) => handleChange('accommodationInfo', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transportation Information
              </label>
              <textarea
                value={formData.transportationInfo}
                onChange={(e) => handleChange('transportationInfo', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Instructions
              </label>
              <textarea
                value={formData.specialInstructions}
                onChange={(e) => handleChange('specialInstructions', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              ></textarea>
            </div>
          </div>
        </div>
        
        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className={`px-6 py-3 rounded-lg font-medium ${
              isSaving
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {isSaving ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
        
        {/* Save Message */}
        {saveMessage && (
          <div className={`mt-4 p-4 rounded-lg ${
            saveMessage.includes('Error') 
              ? 'bg-red-50 border border-red-200 text-red-700' 
              : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
          }`}>
            {saveMessage}
          </div>
        )}
      </form>
    </div>
  );
}
