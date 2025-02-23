// src/components/InfluencerRecommendation.tsx

import { useState } from 'react';

const InfluencerRecommendation = () => {
  const [creatorName, setCreatorName] = useState('');
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async () => {
    if (!creatorName) return;

    try {
      const response = await fetch(API_BASE_URL + '/api/influencer/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ creatorName }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit recommendation');
      }

      setCreatorName('');
      alert('Recommendation sent!');
    } catch (error) {
      console.error('Error submitting recommendation:', error);
    }
  };

  return (
    <div className="p-4 rounded-lg flex flex-col items-start justify-start">
      <span className="text-white">Is there a creator you’d like to see on Fitbite? Let us know below!</span>
      <div className="flex items-center bg-white rounded-lg w-full">
        <input
          type="text"
          placeholder="Enter creator name or handle"
          value={creatorName}
          onChange={(e) => setCreatorName(e.target.value)}
          className="px-4 py-2 rounded-l-lg border-none focus:outline-none w-full"
        />
        <button
          onClick={handleSubmit}
          className="bg-[#09C274] text-white px-4 py-2 rounded-r-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default InfluencerRecommendation;