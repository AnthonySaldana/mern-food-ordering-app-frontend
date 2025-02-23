import { useQuery } from "react-query";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const usePreProcessedMatches = (storeId: string, influencerId: string) => {
    return useQuery(
      ['preProcessedMatches', storeId, influencerId],
      async () => {
        const queryParams = new URLSearchParams({
          store_id: storeId,
          influencer_id: influencerId
        });
  
        const response = await fetch(`${API_BASE_URL}/api/grocery/pre-processed-matches?${queryParams}`);
  
        if (!response.ok) {
          throw new Error('Failed to fetch pre-processed matches');
        }
  
        return response.json();
      },
      {
        enabled: false,
        cacheTime: 5 * 60 * 1000,
        staleTime: 5 * 60 * 1000,
        retry: 0
      }
    );
  };
  