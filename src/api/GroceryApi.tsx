import { useQuery } from "react-query";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type StoreMatch = {
  store_id: string;
  store_name: string;
  matchedItems: Array<{
    requestedItem: any;
    foundProduct: any;
    price: number;
  }>;
  missingItems: any[];
  totalPrice: number;
  matchPercentage: number;
};

export const useSearchGroceryStores = (params: {
  latitude: number;
  longitude: number;
  query?: string;
  maximumMiles?: number;
}) => {
  const { latitude, longitude, query = "", maximumMiles = 3 } = params;

  return useQuery(
    ["groceryStores", { latitude, longitude, query, maximumMiles }],
    async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/grocery/search/stores?latitude=${latitude}&longitude=${longitude}&query=${query}&maximumMiles=${maximumMiles}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch grocery stores");
      }
      return response.json();
    },
    {
      enabled: !!latitude && !!longitude,
    }
  );
};

export const useSearchProducts = (params: {
  query: string;
  latitude: number;
  longitude: number;
  maximumMiles?: number;
}) => {
  const { query, latitude, longitude, maximumMiles = 1.5 } = params;

  return useQuery(
    ["groceryProducts", { query, latitude, longitude, maximumMiles }],
    async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/grocery/search/products?query=${query}&latitude=${latitude}&longitude=${longitude}&maximumMiles=${maximumMiles}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      return response.json();
    },
    {
      enabled: !!query && !!latitude && !!longitude,
    }
  );
};

export const useFindStoresForShoppingList = (params: {
  shoppingListId?: string;
  menuItems: any[];
  latitude: number;
  longitude: number;
  maximumMiles?: number;
}) => {
  const { menuItems, latitude, longitude, maximumMiles = 3 } = params;

  return useQuery(
    ["storeMatches", { menuItems, latitude, longitude, maximumMiles }],
    async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/grocery/find-stores-for-shopping-list`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            menuItems,
            latitude,
            longitude,
            maximumMiles
          })
        }
      );
      if (!response.ok) {
        throw new Error("Failed to find stores for shopping list");
      }
      return response.json();
    },
    {
      enabled: menuItems.length > 0 && !!latitude && !!longitude,
    }
  );
};

export const useStoreInventory = (params: {
  store_id: string;
  subcategory_id?: string;
  latitude: number;
  longitude: number;
}) => {
  const { store_id, subcategory_id, latitude, longitude } = params;

  return useQuery(
    ['storeInventory', { store_id, subcategory_id, latitude, longitude }],
    async () => {
      const queryParams = new URLSearchParams({
        store_id,
        ...(subcategory_id && { subcategory_id }),
        latitude: latitude.toString(),
        longitude: longitude.toString()
      });

      const response = await fetch(
        `${API_BASE_URL}/api/grocery/inventory?${queryParams}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch store inventory');
      }
      return response.json();
    },
    {
      enabled: !!store_id && !!latitude && !!longitude,
      // Cache the results for 5 minutes
      cacheTime: 5 * 60 * 1000,
      staleTime: 5 * 60 * 1000
    }
  );
};
