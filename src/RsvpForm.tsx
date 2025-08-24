'use client';
import { useState } from 'react';

export default function RsvpForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [attending, setAttending] = useState(true);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes only
      console.log('RSVP submitted:', { name, email, attending });
      setStatus('success');
      setName('');
      setEmail('');
    } catch (err) {
      console.error('Form submission error:', err);
      setErrorMsg('Failed to submit RSVP. Please try again.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="glass-strong rounded-3xl p-12 border-glow animate-scale-in">
        <div className="text-center">
          <div className="text-8xl mb-8 animate-float">🎉</div>
          <h3 className="font-playfair text-4xl font-black text-white mb-6 text-glow">Thank You!</h3>
          <p className="text-gray-300 text-xl leading-relaxed">
            Your RSVP has been received. We can't wait to celebrate with you!
          </p>
          <div className="mt-8 w-32 h-1 bg-gradient-to-r from-teal-400 to-cyan-400 mx-auto animate-glow" />
        </div>
      </div>
    );
  }

  return (
    <div className="glass-strong rounded-3xl p-12 border-glow animate-scale-in">
      <form onSubmit={handleSubmit} className="space-y-8">
        {status === 'error' && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-6 animate-fade-in-left">
            <p className="text-red-300 text-center text-lg">
              {errorMsg}
            </p>
          </div>
        )}

        <div className="space-y-4">
          <label className="block text-white font-space font-bold mb-3 text-xl text-glow">
            Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-black/30 border border-white/20 rounded-2xl px-6 py-4 text-white placeholder-gray-400 focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-400/20 transition-all duration-300 text-lg font-inter hover:bg-black/40 focus:bg-black/40"
            placeholder="Enter your full name"
            disabled={status === 'loading'}
          />
        </div>

        <div className="space-y-4">
          <label className="block text-white font-space font-bold mb-3 text-xl text-glow">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-black/30 border border-white/20 rounded-2xl px-6 py-4 text-white placeholder-gray-400 focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-400/20 transition-all duration-300 text-lg font-inter hover:bg-black/40 focus:bg-black/40"
            placeholder="Enter your email address"
            disabled={status === 'loading'}
          />
        </div>

        <div className="space-y-6">
          <label className="block text-white font-space font-bold mb-4 text-xl text-glow">
            Will you be attending?
          </label>
          <div className="grid grid-cols-2 gap-6">
            <label className="cursor-pointer magnetic">
              <input
                type="radio"
                name="attending"
                checked={attending === true}
                onChange={() => setAttending(true)}
                className="sr-only"
                disabled={status === 'loading'}
              />
              <div className={`p-6 rounded-2xl border-2 text-center transition-all duration-500 backdrop-blur-sm ${
                attending === true 
                  ? 'border-teal-400 bg-teal-400/20 shadow-lg shadow-teal-400/20 animate-glow' 
                  : 'border-white/20 bg-black/30 hover:border-white/40 hover:bg-black/40'
              }`}>
                <div className="text-4xl mb-4 animate-bounce">✅</div>
                <span className="text-white font-space font-bold text-lg">Yes, I'll be there!</span>
              </div>
            </label>
            
            <label className="cursor-pointer magnetic">
              <input
                type="radio"
                name="attending"
                checked={attending === false}
                onChange={() => setAttending(false)}
                className="sr-only"
                disabled={status === 'loading'}
              />
              <div className={`p-6 rounded-2xl border-2 text-center transition-all duration-500 backdrop-blur-sm ${
                attending === false 
                  ? 'border-red-400 bg-red-400/20 shadow-lg shadow-red-400/20 animate-glow' 
                  : 'border-white/20 bg-black/30 hover:border-white/40 hover:bg-black/40'
              }`}>
                <div className="text-4xl mb-4 animate-bounce">❌</div>
                <span className="text-white font-space font-bold text-lg">Sorry, I can't make it</span>
              </div>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-2xl py-4 font-space font-bold text-xl hover:from-teal-500 hover:to-cyan-500 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-teal-500/30 disabled:opacity-50 disabled:cursor-not-allowed border-glow hover-glow"
        >
          {status === 'loading' ? (
            <span className="animate-loading-dots">Submitting...</span>
          ) : (
            'Submit RSVP'
          )}
        </button>
      </form>
    </div>
  );
}