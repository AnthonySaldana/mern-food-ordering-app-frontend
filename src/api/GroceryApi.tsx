import { useQuery } from "react-query";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// type StoreMatch = {
//   store_id: string;
//   store_name: string;
//   matchedItems: Array<{
//     requestedItem: any;
//     foundProduct: any;
//     price: number;
//   }>;
//   missingItems: any[];
//   totalPrice: number;
//   matchPercentage: number;
// };

export const useSearchGroceryStores = (params: {
  latitude: number;
  longitude: number;
  query?: string;
  maximumMiles?: number;
  open?: boolean;
  pickup?: boolean;
  sort?: string;
  search_focus?: string;  
  user_street_num?: string;
  user_street_name?: string;
  user_city?: string;
  user_state?: string;
  user_zipcode?: string;
  user_country?: string;
}) => {
  const { latitude, longitude, query = "", maximumMiles = 5, open, pickup, sort, search_focus, user_street_num, user_street_name, user_city, user_state, user_zipcode, user_country } = params;

  return useQuery(
    ["groceryStores", { latitude, longitude, query, maximumMiles, open, pickup, sort, search_focus, user_street_num, user_street_name, user_city, user_state, user_zipcode, user_country }],
    async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/grocery/search/stores?latitude=${latitude}&longitude=${longitude}&query=${query}&maximumMiles=${maximumMiles}&open=${open}&pickup=${pickup}&sort=${sort}&search_focus=${search_focus}&user_street_num=${user_street_num}&user_street_name=${user_street_name}&user_city=${user_city}&user_state=${user_state}&user_zipcode=${user_zipcode}&user_country=${user_country}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch grocery stores");
      }
      return response.json();
    },
    {
      enabled: !!latitude && !!longitude,
      retry: 0,
    }
  );
};

export const useSearchProducts = (params: {
  query: string;
  latitude: number;
  longitude: number;
  maximumMiles?: number;
  user_street_num?: string;
  user_street_name?: string;
  user_city?: string;
  user_state?: string;
  user_zipcode?: string;
  user_country?: string;
}) => {
  const { query, latitude, longitude, maximumMiles = 1.5, user_street_num, user_street_name, user_city, user_state, user_zipcode, user_country } = params;

  return useQuery(
    ["groceryProducts", { query, latitude, longitude, maximumMiles, user_street_num, user_street_name, user_city, user_state, user_zipcode, user_country }],
    async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/grocery/search/products?query=${query}&latitude=${latitude}&longitude=${longitude}&maximumMiles=${maximumMiles}&user_street_num=${user_street_num}&user_street_name=${user_street_name}&user_city=${user_city}&user_state=${user_state}&user_zipcode=${user_zipcode}&user_country=${user_country}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      console.log(data, 'products found here');
      return data.products;
    },
    {
      enabled: false,
      retry: 0,
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
      retry: 0,
    }
  );
};

export const useStoreInventory = (params: {
  store_id: string;
  subcategory_id?: string;
  latitude: number;
  longitude: number;
  user_street_num?: string;
  user_street_name?: string;
  user_city?: string;
  user_state?: string;
  user_zipcode?: string;
  user_country?: string;
}) => {
  const { store_id, subcategory_id, latitude, longitude, user_street_num, user_street_name, user_city, user_state, user_zipcode, user_country } = params;

  return useQuery(
    ['storeInventory', { store_id, subcategory_id, latitude, longitude, user_street_num, user_street_name, user_city, user_state, user_zipcode, user_country }],
    async () => {
      const queryParams = new URLSearchParams({
        store_id,
        ...(subcategory_id && { subcategory_id }),
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        user_street_num: user_street_num || '',
        user_street_name: user_street_name || '',
        user_city: user_city || '',
        user_state: user_state || '',
        user_zipcode: user_zipcode || '',
        user_country: user_country || ''
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
      retry: 0,
      cacheTime: 5 * 60 * 1000,
      staleTime: 5 * 60 * 1000
    }
  );
};

export const useSearchCart = (params: {
  query: string;
  latitude: number;
  longitude: number;
  maximumMiles?: number;
  user_street_num?: string;
  user_street_name?: string;
  user_city?: string;
  user_state?: string;
  user_zipcode?: string;
  user_country?: string;
}) => {
  const { query, latitude, longitude, maximumMiles = 3, user_street_num, user_street_name, user_city, user_state, user_zipcode, user_country } = params;

  return useQuery(
    ["cartProducts", { query, latitude, longitude, maximumMiles, user_street_num, user_street_name, user_city, user_state, user_zipcode, user_country }],
    async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/grocery/search/cart?query=${query}&latitude=${latitude}&longitude=${longitude}&maximumMiles=${maximumMiles}&user_street_num=${user_street_num}&user_street_name=${user_street_name}&user_city=${user_city}&user_state=${user_state}&user_zipcode=${user_zipcode}&user_country=${user_country}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch cart products");
      }
      const data = await response.json();
      console.log(data, 'cartProducts found here');
      return data.carts;
    },
    {
      enabled: false,
      retry: false,
      retryOnMount: false,
      refetchOnWindowFocus: false
    }
  );
};
