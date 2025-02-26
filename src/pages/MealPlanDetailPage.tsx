import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
// import { Influencer, MenuItem as MenuItemType } from "@/types";
import { Influencer, Address } from "@/types";
// import { Card } from "@/components/ui/card";
import MenuItem from "@/components/MenuItem";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchGroceryStores, useStoreInventory, useFitbiteInventory } from "@/api/GroceryApi";
import { usePreProcessedMatches } from "@/api/MatchApi";
import PaymentMethodSection from "@/components/PaymentMethodSection";
import AddressSection from "@/components/AddressSection";
import { useGetMyOrders } from "@/api/OrderApi";
// import { ShoppingListItemType } from '../types/grocery';
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import QuoteDetails from "@/components/QuoteMealMe";
import LoadingOverlay from "@/components/LoadingOverlay";
import { useAuth0 } from "@auth0/auth0-react";
import { useLocation } from "react-router-dom";
import ShoppingListComponent from "@/components/ShoppingListItem";
import { ShoppingListItem } from "@/types";
import MatchingTutorial from "@/components/matchingTutorial";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const fetchInfluencerById = async (id: string): Promise<Influencer> => {
  const response = await fetch(`${API_BASE_URL}/api/influencer/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch influencer");
  }
  return response.json();
};

const MealPlanDetailPage = () => {
  const isStoresExpanded = true;
  const { influencerId, planIndex } = useParams();
  const [selectedDeliveryDate, setSelectedDeliveryDate] = useState<string | null>("ASAP");
  const [selectedStartDay, setSelectedStartDay] = useState<string | null>("Mon");
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [isPlanExpanded, setIsPlanExpanded] = useState(false);
  const [isOrderPage, setIsOrderPage] = useState(false);
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  // const [isStoresExpanded, setIsStoresExpanded] = useState(true);
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [location, setLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const navigate = useNavigate();
  const randValue = () => Math.random() - 0.5;
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [specialInstructions, setSpecialInstructions] = useState<string>("n/a");
  const [open, setOpen] = useState(true);
  const [pickup, setPickup] = useState(false);
  const [sort, setSort] = useState('relevance');
  const [searchFocus, setSearchFocus] = useState('store');
  const [query, setQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [quote, setQuote] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [activeMatchedItems, setActiveMatchedItems] = useState<any>({});
  const [quantities, setQuantities] = useState<any>({});
  const [trackingLink, setTrackingLink] = useState<string | null>(null);
  const [isShoppingListReady, setIsShoppingListReady] = useState(false);
  const { loginWithRedirect, isAuthenticated, user } = useAuth0();
  const { pathname } = useLocation();

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      setEmail(user.email);
      // Extract isOrderPage from the query parameters
      const params = new URLSearchParams(window.location.search);
      const isOrderPageParam = params.get('isOrderPage');
      if (isOrderPageParam !== null) {
        setIsOrderPage(isOrderPageParam === 'true');
      }
    }
  }, [isAuthenticated, user]);

  const handleLogin = async () => {
    if (!isAuthenticated) {
      await loginWithRedirect({
        appState: {
          returnTo: pathname + `?isOrderPage=${isOrderPage}`,
        },
      });
    }
  };

  const handleCreateAccount = async () => {
    if (!isAuthenticated) {
      await loginWithRedirect({
        appState: {
          returnTo: pathname + `?isOrderPage=${isOrderPage}`,
        },
        authorizationParams: {
          screen_hint: 'signup',
        },
      });
    }
  };

  console.log(errorMessage, 'errorMessage found here');

  const { data: influencer, isLoading: isLoadingInfluencer, error } = useQuery(
    ["fetchInfluencer", influencerId],
    () => fetchInfluencerById(influencerId as string),
    {
      enabled: !!influencerId,
    }
  );

  const plan = influencer?.mealPlans[Number(planIndex) || 0];

  const { data: storeMatches, refetch: refetchStoreMatches } = useSearchGroceryStores({
    latitude: location?.latitude || 0,
    longitude: location?.longitude || 0,
    open,
    pickup,
    sort,
    user_street_num: selectedAddress?.streetNum,
    user_street_name: selectedAddress?.streetName,
    user_city: selectedAddress?.city,
    user_state: selectedAddress?.state,
    user_zipcode: selectedAddress?.zipcode,
    user_country: selectedAddress?.country,
    search_focus: searchFocus,
    query
  });

  const { orders, isLoading: isLoadingOrders } = useGetMyOrders(influencerId as string);
  console.log(isLoadingOrders, 'isLoadingOrders')

  // useEffect(() => {
  //   // Re-call the search stores endpoint when options change
  //   refetch();
  // }, [open, pickup, sort, searchFocus, query, location, refetch]);

  const { data: inventory, isLoading: inventoryLoading, refetch: refetchInventory } = useStoreInventory({
    store_id: selectedStore?._id,
    ...(selectedCategory?.subcategory_id && { subcategory_id: selectedCategory.subcategory_id }),
    latitude: location?.latitude || 0,
    longitude: location?.longitude || 0,
    user_street_num: selectedAddress?.streetNum,
    user_street_name: selectedAddress?.streetName,
    user_city: selectedAddress?.city,
    user_state: selectedAddress?.state,
    user_zipcode: selectedAddress?.zipcode,
    user_country: selectedAddress?.country
  });

  const { data: fitbiteInventory, error: storeError } = useFitbiteInventory(
    selectedStore?._id, // Initial empty storeId
    plan?.menuItems || [], // Initial empty menuItems
    influencerId as string // Initial empty influencerId
  );

  console.log(fitbiteInventory, 'fitbiteInventory')

  useEffect(() => {
    if (inventory && !selectedCategory) {
      setQuote(inventory.quote);
    }
  }, [inventory, selectedCategory]);

  useEffect(() => {
    if (storeError) {
      const errorMessage = "This store is not available right now. Please select a different store.";
      setErrorMessage(errorMessage);
      toast.error(errorMessage); // Display the error using a toast notification
    }
  }, [storeError]);

  const { data: preProcessedMatches, error: matchesError } = usePreProcessedMatches(
    selectedStore?._id,
    influencerId as string
  );
  
  useEffect(() => {
    if (matchesError) {
      const errorMessage = "Failed to fetch pre-processed matches.";
      setErrorMessage(errorMessage);
      toast.error(errorMessage);
    }
  }, [matchesError]);
  
  useEffect(() => {
    if (preProcessedMatches) {
      console.log("Pre-processed matches fetched successfully:", preProcessedMatches);
      // Handle success (e.g., update state or UI)
    }
  }, [preProcessedMatches]);

  useEffect(() => {
    if (storeMatches?.stores?.length) {
      const storesSection = document.getElementById('stores-section');
      if (storesSection) {
        storesSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [storeMatches]);

  useEffect(() => {
    const fetchSavedConfig = async () => {
      if (!isAuthenticated || !user || shoppingList.length === 0) return;

      try {
        const response = await fetch(`${API_BASE_URL}/api/shoppingList/get?userId=${user.sub}&influencerId=${influencerId}&storeId=${selectedStore?._id}`);
        if (response.ok) {
          const config = await response.json();
          // setShoppingList(config.shoppingList);
          // setShoppingList(prevList => [
          //   ...prevList,
          //   ...config.shoppingList.filter((item: any) => item.matchedItem)
          // ]);
          console.log(config.shoppingList, 'config.shoppingList')
          // setActiveMatchedItems(config.shoppingList.reduce((acc: any, item: any) => {
          //   // Check if inventoryItem and matchedItem exist
          //   if (item.matchedItem) {
          //     acc[item.product_id] = item.matchedItem.matched_item_id;
          //   }
          //   return acc;
          // }, {}));
          // setQuantities(config.shoppingList.reduce((acc: any, item: any) => {
          //   acc[item.product_id] = item.quantity;
          //   return acc;
          // }, {}));
        }
      } catch (error) {
        console.error("Failed to fetch saved configuration", error);
      }
    };

    fetchSavedConfig();
  }, [isAuthenticated, user, influencerId, selectedStore, isShoppingListReady]);

  console.log(storeMatches, 'storeMatches found here');

  const fetchCoordinates = async (address: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/grocery/geocode-address`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address })
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch coordinates');
      }
  
      const data = await response.json();
      return data; // Assuming the backend returns the coordinates directly
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      return null;
    }
  };

  const updateDeliveryDetails = async () => {
    if (selectedAddress) {
      console.log(selectedAddress, 'selectedAddress in updateDeliveryDetails')
      const address = `${selectedAddress.streetNum} ${selectedAddress.streetName}, ${selectedAddress.city} ${selectedAddress.state} ${selectedAddress.zipcode}, ${selectedAddress.country}`;
      const coordinates = await fetchCoordinates(address);
      if (coordinates) {
        setLocation({
          latitude: coordinates.lat,
          longitude: coordinates.lng
        });
        // Trigger the store search manually
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        await refetchStoreMatches();
        setIsLoading(false);
      }
    }
  };

  if (!plan) {
    return <div>No meal plan found</div>;
  }

  if (isLoadingInfluencer) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error fetching influencer</div>;
  }

  if (!influencer?.mealPlans?.length) {
    return <div>No meal plans found</div>;
  }

  const addToShoppingList = (item: any) => {
    setShoppingList(prevList => {
      const existingItem = prevList.find(listItem => listItem.product_id === item.id);
      
      if (existingItem) {
        return prevList.map(listItem => 
          listItem.product_id === item.id 
            ? { ...listItem, quantity: listItem.quantity + 1 }
            : listItem
        );
      }

      const newItem: ShoppingListItem = {
        _id: item.id,
        product_id: item.id,
        name: item.name,
        searchTerm: item.searchTerm || item.name,
        quantity: 1,
        macros: {
          protein: item.macros?.protein,
          carbs: item.macros?.carbs,
          fat: item.macros?.fat
        },
        unit_of_measurement: item.unit_of_measurement,
        unit_size: item.unit_size,
        unit_details: item.unit_details,
        product_marked_price: Math.round(item.price * 100), // Convert to cents
        selected_options: [] // Add options if available from the API
      };

      return [...prevList, newItem];
    });
  };

  const handleCreateOrder = async (total: number, activeMatchedItems: any, quantities: any) => {
    if (!selectedStore || !location) {
      console.error("Store or location not selected");
      return;
    }

    if (!selectedPaymentMethod) {
      toast.error("Please select a payment method before placing your order");
      return;
    }

    const userName = user?.name || email; // Use user's name if available, otherwise fallback to email

    const deliveryDetails = {
      address: `${selectedAddress?.streetNum} ${selectedAddress?.streetName}, ${selectedAddress?.city} ${selectedAddress?.state} ${selectedAddress?.country}, ${selectedAddress?.zipcode}`,
      latitude: location.latitude,
      longitude: location.longitude,
      street_num: selectedAddress?.streetNum,
      street_name: selectedAddress?.streetName,
      city: selectedAddress?.city,
      state: selectedAddress?.state,
      zipcode: selectedAddress?.zipcode,
      country: selectedAddress?.country,
      instructions: specialInstructions,
      tip_amount: tipAmount,
      user_email: user?.email || email
    };

    console.log(user, 'user')

    const orderData = {
      store_id: selectedStore._id,
      items: shoppingList.map(item => {
        const activeMatch = activeMatchedItems[item.product_id] || null;
        return {
          product_id: activeMatchedItems[item.product_id]?.product_id,
          quantity: activeMatch ? quantities[activeMatch._id] : 1
        };
      }).filter(item => item.product_id),
      delivery_details: deliveryDetails,
      payment_details: {
        payment_method_id: selectedPaymentMethod,
        payment_amount: total
      },
      place_order: true,
      final_quote: false,
      influencer_id: influencer._id,
      meal_plan_name: plan.name,
      plan_start_day: selectedStartDay,
      username: userName, // Add the username parameter
      userid: user?._id
    };

    console.log(orderData, 'orderData')

    await saveShoppingListConfig();

    try {
      const response = await fetch(`${API_BASE_URL}/api/grocery/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(errorData.message || "Failed to create order");
        toast.error(errorData.message || "Failed to create order");
        return;
      }

      const data = await response.json();
      
      if (data.order_placed && data.tracking_link) {
        // Set the tracking link state instead of opening a new window
        setTrackingLink(data.tracking_link.replace('tracking.fitbite.app', 'tracking.mealme.ai'));
      } else {
        // Handle the case where the order was not placed successfully
        toast.error("Order could not be placed. Please try again.");
      }

      console.log("Order created successfully:", data);
    } catch (error) {
      console.error("Error creating order:", error);
      setErrorMessage("Error creating order");
      toast.error("Error creating order");
    }
  };

  const areDeliveryDetailsComplete = () => {
    return storeMatches?.stores?.length > 0;
  };

  console.log(fitbiteInventory, 'fitbiteInventory')

  const handleOrderPlan = async (store: any) => {
    console.log("storeId", store);
    setIsLoading(true);
    setSelectedStore(store);
    if (!plan || !plan.menuItems) {
      console.error("No meal plan or menu items found");
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms

    try {
      // Update query parameters and refetch
      // const result = await fetchFitbiteInventory();
      const requestBody = {
        store_id: store._id,
        items: plan.menuItems,
        influencer_id: influencer._id
      };

      let matchesResult;
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < 1) {
        toast("We are matching your items, please wait...");

        // Get matches for this store and influencer
        const matchesResponse = await fetch(`${API_BASE_URL}/api/matches/pre-processed-matches?store_id=${store._id}&influencer_id=${influencer._id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (matchesResponse.ok) {
          matchesResult = await matchesResponse.json();
          
          if (matchesResult?.matches && matchesResult.matches.length > 0) {
            // Convert matches to shopping list format
            const shoppingListItems = matchesResult.matches.map((match: any) => ({
              product_id: match._id,
              name: match.name,
              searchTerm: match.searchTerm,
              quantity: match.adjusted_quantity,
              product_marked_price: Math.round(match.price * 100), // Convert to cents
              // matched_items: match.matched_items,
              unit_of_measurement: match.unit_of_measurement,
              unit_size: match.unit_size,
              unit_details: match.unit_details,
              macros: {
                protein: match.macros?.protein,
                carbs: match.macros?.carbs,
                fat: match.macros?.fat
              },
              selected_options: []
            }));

            setShoppingList(shoppingListItems);
            setIsShoppingListReady(true);
            console.log("Shopping list updated with matches:", shoppingListItems);
            break;
          }
        }

        attempts++;
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 10000));
        }
      }

      if (!matchesResult?.matches || matchesResult.matches.length === 0) {
        // Call fitbite-inventory endpoint if no matches found
        const response = await fetch(`${API_BASE_URL}/api/grocery/fitbite-inventory`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          throw new Error('Failed to fetch fitbite inventory');
        }

        const result = await response.json();
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms

        if (result) {
          console.log("Fitbite inventory fetched successfully:", result);
          toast.error("Could not find matches for your items. Please try again.");
        }
      }

      while (attempts < maxAttempts) {
        toast("We are matching your items, please wait...");

        // Get matches for this store and influencer
        const matchesResponse = await fetch(`${API_BASE_URL}/api/matches/pre-processed-matches?store_id=${store._id}&influencer_id=${influencer._id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (matchesResponse.ok) {
          matchesResult = await matchesResponse.json();
          
          if (matchesResult?.matches && matchesResult.matches.length > 0) {
            // Convert matches to shopping list format
            const shoppingListItems = matchesResult.matches.map((match: any) => ({
              product_id: match._id,
              name: match.name,
              searchTerm: match.searchTerm,
              quantity: match.adjusted_quantity,
              product_marked_price: Math.round(match.price * 100), // Convert to cents
              // matched_items: match.matched_items,
              unit_of_measurement: match.unit_of_measurement,
              unit_size: match.unit_size,
              unit_details: match.unit_details,
              macros: {
                protein: match.macros?.protein,
                carbs: match.macros?.carbs,
                fat: match.macros?.fat
              },
              selected_options: []
            }));

            setShoppingList(shoppingListItems);
            setIsShoppingListReady(true);
            console.log("Shopping list updated with matches:", shoppingListItems);
            break;
          }
        }

        attempts++;
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 10000));
        }
      }
    } catch (error) {
      console.error("Error fetching fitbite inventory:", error);
      toast.error("Failed to fetch fitbite inventory");
    } finally {
      // setIsLoading(false);
    }
  };

  const handleProcessAndOrder = async (store: any) => {
    setSelectedStore(store);
    setSelectedCategory(null); // Reset category selection when switching stores
  
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/grocery/process-inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          store_id: store._id,
          latitude: location?.latitude || 0,
          longitude: location?.longitude || 0,
          user_street_num: selectedAddress?.streetNum,
          user_street_name: selectedAddress?.streetName,
          user_city: selectedAddress?.city,
          user_state: selectedAddress?.state,
          user_zipcode: selectedAddress?.zipcode,
          user_country: selectedAddress?.country
        })
      });
  
      if (!response.ok) {
        toast.error("This store is not available right now. Please select a different store.");
        throw new Error('Failed to queue inventory processing');
      }
  
      toast.success("Inventory for this store is being processed. Please order in a minute.");
      console.log('Inventory processing job added to the queue');
  
      // Wait for 20 seconds before proceeding to order
      await new Promise(resolve => setTimeout(resolve, 10000));
  
      // Proceed to order
      await handleOrderPlan(store);
  
    } catch (error) {
      console.error('Error processing inventory and creating order:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveShoppingListConfig = async () => {
    if (!isAuthenticated || !user) return;

    console.log(shoppingList, 'shoppingList in save')

    const config = {
      userId: user.sub,
      influencerId,
      storeId: selectedStore?._id,
      shoppingList: shoppingList.map(item => ({
        match_id: item._id,
        product_id: item.product_id,
        matched_item_id: activeMatchedItems[item.product_id],
        quantity: quantities[item.product_id] || 1,
      })),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/shoppingList/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error("Failed to save shopping list configuration");
      }

      toast("Shopping list configuration saved successfully!");
    } catch (error) {
      console.error(error);
      toast("Failed to save shopping list configuration");
    }
  };

  if (isOrderPage) {
    return (
      <div className="flex flex-col lg:flex-row mt-[40px]">
        {isLoading && <LoadingOverlay />}
        <div className="flex lg:w-2/3 flex-col gap-4 bg-white p-3 rounded-md" style={{ borderRadius: '24px 24px 0 0' }}>
          {trackingLink && (
            <div className="bg-green-100 p-4 rounded-md mb-4 md:mx-32 mx-2">
              <p>Your order has been placed successfully! Track your order <a href={trackingLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">here</a>.</p>
            </div>
          )}
          <div className="flex flex-row items-center gap-2 md:px-32 cursor-pointer" onClick={() => setIsOrderPage(false)}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M15.8936 3.5173C16.3818 3.5173 16.7776 3.12151 16.7776 2.63328C16.7776 2.14506 16.3818 1.74927 15.8936 1.74927H2.63334C2.14511 1.74927 1.74933 2.14506 1.74933 2.63328V15.8935C1.74933 16.3818 2.14511 16.7776 2.63334 16.7776C3.12157 16.7776 3.51736 16.3818 3.51736 15.8935V4.76749L16.7419 17.992C17.0871 18.3372 17.6468 18.3372 17.9921 17.992C18.3373 17.6468 18.3373 17.087 17.9921 16.7418L4.76755 3.5173H15.8936Z" fill="black"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M16.8596 2.63327C16.8596 2.09948 16.4269 1.66675 15.8931 1.66675H2.63286C2.09907 1.66675 1.66634 2.09948 1.66634 2.63327V15.8935C1.66634 16.4273 2.09907 16.8601 2.63286 16.8601C3.16666 16.8601 3.59939 16.4273 3.59939 15.8935V4.96667L16.683 18.0503C17.0605 18.4278 17.6725 18.4278 18.0499 18.0503C18.4274 17.6729 18.4274 17.0609 18.0499 16.6835L4.96626 3.5998H15.8931C16.4269 3.5998 16.8596 3.16707 16.8596 2.63327ZM15.8931 1.83176C16.3358 1.83176 16.6946 2.19061 16.6946 2.63327C16.6946 3.07593 16.3358 3.43478 15.8931 3.43478H4.76707C4.7337 3.43478 4.70361 3.45488 4.69084 3.48572C4.67807 3.51655 4.68513 3.55204 4.70873 3.57563L17.9332 16.8001C18.2462 17.1131 18.2462 17.6206 17.9332 17.9336C17.6202 18.2467 17.1127 18.2467 16.7997 17.9336L3.57522 4.70914C3.55163 4.68554 3.51614 4.67848 3.48531 4.69125C3.45448 4.70402 3.43437 4.73411 3.43437 4.76748V15.8935C3.43437 16.3362 3.07553 16.695 2.63286 16.695C2.1902 16.695 1.83136 16.3362 1.83136 15.8935V2.63327C1.83136 2.19061 2.1902 1.83176 2.63286 1.83176H15.8931Z" fill="black"/>
            </svg>
            <p>Back</p>
          </div>
          <div className="bg-white rounded-xl relative md:px-32 px-2">
            <div 
              className="flex justify-between items-center cursor-pointer" 
              onClick={() => setIsMenuExpanded(!isMenuExpanded)}
            >
              <p className="text-md font-bold mb-4">Plan Items ({plan.menuItems.length})</p>
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24"
                className={`transition-transform ${isMenuExpanded ? 'rotate-180' : ''}`}
              >fd
                <path 
                  d="M19 9l-7 7-7-7" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>
            {isMenuExpanded && (
              <div className="grid grid-cols-3 md:grid-cols-3 xs:grid-cols-3 gap-4">
                {plan.menuItems.map((menuItem) => (
                  <MenuItem
                    key={menuItem._id}
                    menuItem={menuItem}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="px-2 md:px-32">
            <div className="space-y-4">
              <div className="bg-[#F2F6FB] rounded-xl p-6">
                <div className="block mb-2">
                  {isAuthenticated ? (
                    <>
                      <h3 className="text-lg font-semibold mb-3">Email</h3>
                      <input
                        type="email"
                        value={email}
                        disabled
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100"
                      />
                    </>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div className="flex gap-2">
                        <button
                          onClick={handleLogin}
                          className="flex-1 bg-[#09C274] text-white px-4 py-3 rounded-xl font-medium"
                        >
                          Login
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleCreateAccount}
                          className="flex-1 bg-[#09C274] text-white px-4 py-3 rounded-xl font-medium"
                        >
                          Create Account
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-semibold mt-4">Delivery</h3>
                <div className="flex flex-col divide-y">
                  <label className="flex items-center justify-between py-4">
                    <div>
                      <span className="font-medium">ASAP</span>
                      <span className="text-gray-500 ml-2">As soon as possible</span>
                    </div>
                    <input 
                      type="radio" 
                      name="deliveryDate"
                      value="ASAP"
                      checked={selectedDeliveryDate === "ASAP"}
                      onChange={(e) => setSelectedDeliveryDate(e.target.value)}
                      className="h-5 w-5 text-[#ff6d3f]"
                    />
                  </label>
                </div>

                <div className="mt-6">
                  <AddressSection 
                    email={email}
                    onAddressSelect={(address: Address) => setSelectedAddress(address)} 
                  />

                  <label className="block text-gray-600 mt-4">
                    Tip Amount
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2">$</span>
                      <input
                        type="number"
                        step=".50"
                        min="0"
                        placeholder="Tip Amount"
                        value={tipAmount.toFixed(2)}
                        onChange={(e) => setTipAmount(Number(parseFloat(e.target.value).toFixed(2)))}
                        className="w-full mt-2 px-4 py-3 pl-8 rounded-xl border border-gray-200 mb-3 focus:outline-none focus:ring-2 focus:ring-[#ff6d3f]"
                      />
                    </div>
                  </label>
                  <label className="block text-gray-600 mb-2">
                    Special Instructions
                    <textarea
                      placeholder="Special Instructions (optional)"
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-200 mb-3 focus:outline-none focus:ring-2 focus:ring-[#ff6d3f] min-h-[100px] resize-y"
                    />
                  </label>

                  <button 
                    onClick={updateDeliveryDetails}
                    disabled={!selectedAddress}
                    className={`mt-4 px-4 py-3 rounded-xl w-full font-medium ${
                      selectedAddress 
                        ? 'bg-[#09C274] text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {selectedAddress ? 'Search for stores' : 'Select address'}
                  </button>
                </div>
              </div>

              <div className="bg-[#F2F6FB] rounded-xl p-6 relative" id="stores-section">
                <div 
                  className="flex justify-between items-center cursor-pointer" 
                  // onClick={() => setIsStoresExpanded(!isStoresExpanded)}
                >
                  <p className="text-md font-bold">Choose from nearby stores</p>
                </div>
                {isStoresExpanded && (
                  <div className="">
                    <div className="space-y-4 mb-8 hidden">
                      <p className="text-lg font-semibold mb-3">Search Options</p>
                      <div className="flex flex-col gap-4">
                        <label className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={open} 
                            onChange={(e) => setOpen(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 focus:ring-[#ff6d3f]"
                          />
                          <span className="text-gray-600">Open Now</span>
                        </label>
                        
                        <label className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={pickup} 
                            onChange={(e) => setPickup(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 focus:ring-[#ff6d3f]"
                          />
                          <span className="text-gray-600">Pickup Available</span>
                        </label>

                        <div className="flex flex-col gap-2">
                          <label className="text-gray-600">Sort By</label>
                          <select 
                            value={sort} 
                            onChange={(e) => setSort(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff6d3f]"
                          >
                            <option value="relevance">Relevance</option>
                            <option value="cheapest">Cheapest</option>
                            <option value="fastest">Fastest</option>
                            <option value="rating">Rating</option>
                            <option value="distance">Distance</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-gray-600">Search Focus</label>
                          <select 
                            value={searchFocus} 
                            onChange={(e) => setSearchFocus(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff6d3f]"
                          >
                            <option value="store">Store</option>
                            <option value="item">Item</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-gray-600">Search</label>
                          <input 
                            type="text" 
                            value={query} 
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search stores or items..."
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff6d3f]"
                          />
                        </div>
                      </div>
                    </div>
                    {!areDeliveryDetailsComplete() ? (
                      <p className="text-gray-600">Please complete delivery details to see available stores</p>
                    ) : !storeMatches?.stores?.length ? (
                      <p className="text-gray-600">No stores found nearby</p>
                    ) : (
                      <div className="space-y-6">
                        <div className="overflow-x-auto relative">
                          <p className="text-gray-600 mb-4">You can select a store you prefer to check availability and receive your order from</p>
                          <div className="flex flex-row gap-4 pb-4" style={{ minWidth: "120px", height: "120px", overflowX: "scroll" }}>
                            {storeMatches?.stores?.map((store: any, index: number) => (
                              <div 
                                key={store?._id || `unknown-${index}`} 
                                className={`flex-none w-80 p-4 rounded-lg cursor-pointer flex flex-row items-center gap-4 justify-center ${
                                  selectedStore?._id === store._id ? 'bg-white text-black' : 'bg-white'
                                }`}
                                onClick={() => handleProcessAndOrder(store)}
                                // style={{ width: 'calc(100% - 20%)' }} // Adjust width to show part of the next item
                              >
                                <div className={`${selectedStore?._id === store._id ? 'text-green-500' : 'text-blue-500'}`}>
                                  {selectedStore?._id === store._id ? <svg width="30" height="30" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clip-path="url(#clip0_758_39861)">
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M7.4462 1.31423C8.6978 -0.438076 11.3021 -0.438076 12.5538 1.31423L12.7531 1.5932C12.9733 1.9016 13.3432 2.06673 13.7198 2.02488L14.608 1.92619C16.6069 1.7041 18.2959 3.39308 18.0738 5.39196L17.9752 6.28014C17.9333 6.6568 18.0984 7.02665 18.4068 7.24693L18.6858 7.4462C20.4381 8.6978 20.4381 11.3021 18.6858 12.5538L18.4068 12.7531C18.0984 12.9733 17.9333 13.3432 17.9752 13.7198L18.0738 14.608C18.2959 16.6069 16.6069 18.2959 14.608 18.0738L13.7198 17.9752C13.3432 17.9333 12.9733 18.0984 12.7531 18.4068L12.5538 18.6858C11.3021 20.4381 8.6979 20.4381 7.4462 18.6858L7.24693 18.4068C7.02665 18.0984 6.6568 17.9333 6.28013 17.9752L5.39196 18.0738C3.39308 18.2959 1.7041 16.6069 1.92619 14.608L2.02488 13.7198C2.06673 13.3432 1.9016 12.9733 1.5932 12.7531L1.31423 12.5538C-0.438076 11.3021 -0.438076 8.6979 1.31423 7.4462L1.5932 7.24693C1.9016 7.02665 2.06673 6.6568 2.02488 6.28013L1.92619 5.39196C1.7041 3.39308 3.39308 1.7041 5.39196 1.92619L6.28014 2.02488C6.6568 2.06673 7.02665 1.9016 7.24693 1.5932L7.4462 1.31423ZM13.8781 7.16803C14.2866 7.57658 14.2866 8.23897 13.8781 8.64748L9.88306 12.6425C9.36993 13.1558 8.53784 13.1558 8.02472 12.6425L6.12191 10.7397C5.71337 10.3312 5.71337 9.66881 6.12191 9.2603C6.53045 8.85179 7.19282 8.85179 7.60136 9.2603L8.95389 10.6128L12.3987 7.16803C12.8072 6.7595 13.4696 6.7595 13.8781 7.16803Z" fill="#09C274"/>
                                    </g>
                                    <defs>
                                    <clipPath id="clip0_758_39861">
                                    <rect width="20" height="20" fill="white"/>
                                    </clipPath>
                                    </defs>
                                  </svg> : <svg width="30" height="30" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clip-path="url(#clip0_758_39867)">
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M7.4462 1.31423C8.6978 -0.438076 11.3021 -0.438076 12.5538 1.31423L12.7531 1.5932C12.9733 1.9016 13.3432 2.06673 13.7198 2.02488L14.608 1.92619C16.6069 1.7041 18.2959 3.39308 18.0738 5.39196L17.9752 6.28014C17.9333 6.6568 18.0984 7.02665 18.4068 7.24693L18.6858 7.4462C20.4381 8.6978 20.4381 11.3021 18.6858 12.5538L18.4068 12.7531C18.0984 12.9733 17.9333 13.3432 17.9752 13.7198L18.0738 14.608C18.2959 16.6069 16.6069 18.2959 14.608 18.0738L13.7198 17.9752C13.3432 17.9333 12.9733 18.0984 12.7531 18.4068L12.5538 18.6858C11.3021 20.4381 8.6979 20.4381 7.4462 18.6858L7.24693 18.4068C7.02665 18.0984 6.6568 17.9333 6.28013 17.9752L5.39196 18.0738C3.39308 18.2959 1.7041 16.6069 1.92619 14.608L2.02488 13.7198C2.06673 13.3432 1.9016 12.9733 1.5932 12.7531L1.31423 12.5538C-0.438076 11.3021 -0.438076 8.6979 1.31423 7.4462L1.5932 7.24693C1.9016 7.02665 2.06673 6.6568 2.02488 6.28013L1.92619 5.39196C1.7041 3.39308 3.39308 1.7041 5.39196 1.92619L6.28014 2.02488C6.6568 2.06673 7.02665 1.9016 7.24693 1.5932L7.4462 1.31423ZM13.8781 7.16803C14.2866 7.57658 14.2866 8.23897 13.8781 8.64748L9.88306 12.6425C9.36993 13.1558 8.53784 13.1558 8.02472 12.6425L6.12191 10.7397C5.71337 10.3312 5.71337 9.66881 6.12191 9.2603C6.53045 8.85179 7.19282 8.85179 7.60136 9.2603L8.95389 10.6128L12.3987 7.16803C12.8072 6.7595 13.4696 6.7595 13.8781 7.16803Z" fill="#B8BEB6"/>
                                    </g>
                                    <defs>
                                    <clipPath id="clip0_758_39867">
                                    <rect width="20" height="20" fill="white"/>
                                    </clipPath>
                                    </defs>
                                  </svg>}
                                </div>

                                <div>
                                  <h4 className="font-medium">{store?.name || 'Unknown Store'}</h4>
                                  <p className={`text-sm`}>
                                    {store?.address?.street_addr}, {store?.address?.city}
                                    <span className="text-sm text-gray-500">({(store?.miles ?? 0).toFixed(1)} mi)</span>
                                  </p>
                                </div>
                                <div className="mt-2">
                                  <div className="flex items-center gap-1">
                                    {/* <div className={`w-2 h-2 rounded-full ${store?.is_open ? 'bg-[#21ff00]' : 'bg-gray-500'}`}></div> */}
                                    <p className={`text-sm ${selectedStore?.id === store.id ? 'text-white' : 'text-gray-600'}`}>
                                      {store?.is_open ? 'Open' : 'Closed'}
                                    </p>
                                  </div>
                                </div>
                                {/* <button
                                  className="mt-2 bg-[#1C2537] text-white px-4 py-2 rounded-lg"
                                  onClick={() => handleStoreSelection(store)}
                                >
                                  Process Store Inventory
                                </button>
                                <button
                                  className="mt-2 bg-[#1C2537] text-white px-4 py-2 rounded-lg"
                                  onClick={() => handleOrderPlan(store)}
                                >
                                  Order Plan
                                </button> */}
                                {/* <button
                                  className="mt-2 bg-[#1C2537] text-white px-4 py-2 rounded-lg"
                                  onClick={() => handleProcessAndOrder(store)}
                                >
                                  Order
                                </button> */}
                              </div>
                            ))}
                          </div>
                          <div className="absolute right-1 bottom-[40px] transform -translate-y-1/2 md:hidden bg-gray-600/20 rounded-full p-1">
                            <svg width="24" height="24" fill="currentColor" className="text-gray-600">
                              <path d="M8 5l8 7-8 7V5z" />
                            </svg>
                          </div>
                        </div>
                        {selectedStore && false && (
                          <div className="mt-6">
                          {inventory?.quote && (
                            <QuoteDetails quote={quote} />
                          )}
                            <h3 className="text-lg font-semibold mb-4">Categories</h3>
                            <div className="grid grid-cols-2 gap-4">
                              {inventory?.categories?.map((category: any) => (
                                <button
                                  key={category.id}
                                  className={`p-4 rounded-lg text-left ${
                                    selectedCategory?.id === category.id 
                                      ? 'bg-[#09C274] text-white'
                                      : category.has_subcategories 
                                        ? 'bg-[#F2F6FB]'
                                        : 'bg-gray-300'
                                  }`}
                                  onClick={() => {
                                    if (category.has_subcategories) {
                                      setSelectedCategory(category);
                                      refetchInventory();
                                    }
                                  }}
                                >
                                  <p className="font-medium">{category.name}</p>
                                  {/* <p className={`text-sm ${
                                    selectedCategory?.id === category.id 
                                      ? 'text-white' 
                                      : 'text-gray-600'
                                  }`}>
                                    {category.itemCount || 0} items
                                  </p> */}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        {!inventoryLoading && false && (
                          <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-4">Available Items</h3>
                            <div className="grid grid-cols-3 gap-4">
                              {inventory?.categories?.map((category: any) => 
                                category.items?.map((item: any) => (
                                  <div key={item.id} 
                                    className="bg-white rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                                    onClick={() => addToShoppingList(item)}
                                  >
                                    {(item.imageUrl || item.image) && (
                                      <img 
                                        src={item.imageUrl || item.image}
                                        alt={item.name}
                                        className="w-full h-32 object-cover rounded-lg mb-2"
                                      />
                                    )}
                                    <h4 className="font-medium">{item.name}</h4>
                                    <p className="text-sm text-gray-600">${item.price?.toFixed(2)}</p>
                                    {item.is_available ? (
                                      <span className="text-[#09C274] text-sm">In Stock</span>
                                    ) : (
                                      <span className="text-red-500 text-sm">Out of Stock</span>
                                    )}
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}

                        {inventoryLoading && (
                          <div className="mt-6 text-center">
                            <p>Loading inventory...</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-[#F2F6FB] rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3">Plan start</h3>
                <p className="text-gray-600 mb-2">Which day of the week will you start your plan?</p>
                <div className="flex flex-wrap gap-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <button
                      key={day}
                      className={`px-4 py-2 rounded-lg ${selectedStartDay === day ? "bg-[#09C274] text-white" : "bg-transparent border border-gray-200"}`}
                      onClick={() => setSelectedStartDay(day)}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {email && (
                <PaymentMethodSection 
                  email={email}
                  onPaymentMethodSelect={(paymentMethodId) => setSelectedPaymentMethod(paymentMethodId)} 
                />
              )}
              <button 
                onClick={() => setIsOrderPage(false)}
                className="mt-4 bg-white border-2 border-[#09C274] text-[#09C274] px-4 py-3 rounded-xl w-full font-medium"
              >
                Back
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 bg-white p-4 rounded-md lg:w-1/3 lg:px-2 px-16">
          <div className="mb-2 left-0 right-0">
            <div className="flex flex-col items-start gap-2 flex justify-start">
              <h2 className="text-lg font-bold">{plan.name}</h2>
              <div className="flex items-center gap-2">
                <span className="bg-[#D9D6FF] text-black px-4 py-2 rounded-full text-sm font-bold text-center min-w-[150px]">
                  {plan.totalCalories} cal/day
                </span>
                <span className="text-gray-500 text-sm text-center min-w-[150px]">
                  {plan.totalCalories * 7} cal/week
                </span>
              </div>
            </div>
          </div>
          {shoppingList?.length > 0 && <MatchingTutorial />}
          <ShoppingListComponent 
            shoppingList={shoppingList}
            selectedStore={selectedStore}
            // onRemoveItem={removeFromShoppingList} 
            // onUpdateQuantity={updateItemQuantity}
            tipAmount={tipAmount}
            handleCreateOrder={(total: number, activeMatchedItems: any, quantities: any) => handleCreateOrder(total, activeMatchedItems, quantities)}
            initialMatchedItems={activeMatchedItems}
            setInitialMatchedItems={setActiveMatchedItems}
            initialQuantities={quantities}
            setInitialQuantities={setQuantities}
            selectedStoreId={selectedStore?._id}
            // saveShoppingListConfig={saveShoppingListConfig}
          />
          {/* <button 
            className={`mt-4 px-4 py-3 rounded-xl w-full font-medium ${
              shoppingList.length > 0 
                ? 'bg-[#09C274] text-white hover:bg-[#07b369] transition-colors' 
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
            disabled={shoppingList.length === 0}
            onClick={handleCreateOrder}
          >
            {shoppingList.length > 0 
              ? `Confirm and place order`
              : 'Add items to cart'
            }
          </button> */}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 bg-white p-3 rounded-md mt-[80px] lg:p-6 lg:max-w-10xl lg:mx-auto lg:mt-8">
      {/* <div className="block lg:hidden">
        <Card className="w-full h-[320px] relative" style={{boxShadow: 'none'}}>
          <img
            src={influencer.mealPlans[Number(planIndex)].imageUrl}
            className="rounded-xl object-cover h-full w-full"
            alt={influencer.name}
          />
          <div className="absolute bottom-[-20px] left-0 right-0 p-4 rounded-2xl bg-white max-w-[90%] mx-auto border-b-0">
            <div className="flex flex-col gap-4 rounded-md" style={{ borderRadius: '24px 24px 0 0' }}>
              <div className="flex flex-row items-center gap-4 pb-2 cursor-pointer transition-colors rounded-t-lg">
                <div className="flex flex-col gap-2 items-center" style={{width: '100%'}}>
                  <h2 className="text-xl font-bold">{plan.name}</h2>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#D9D6FF] text-black px-3 py-1 rounded-full text-sm font-bold">
                      {plan.totalCalories} cal/day
                    </span>
                    <span className="text-gray-600">{plan.totalCalories * 7} cal/week</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div> */}

      <div className="lg:flex lg:flex-row lg:gap-8">
        <div className="w-full lg:w-2/5">
          <div className="relative">
            <img
              // src={influencer.mealPlans[Number(planIndex)].imageUrl}
              src={influencer.imageUrl}
              className="w-full h-[292px] object-cover object-center rounded-3xl"
              alt={influencer.name}
            />
            <div className="absolute bottom-[-60px] left-6 right-6 bg-white p-6 rounded-2xl max-w-[400px] mx-auto -bottom-[61px] left-0 right-0">
              <h2 className="text-xl font-bold mb-2">{plan.name}</h2>
              <div className="flex items-center gap-2">
                <span className="bg-[#D9D6FF] text-black px-3 py-1 rounded-full text-sm font-bold">
                  {plan.totalCalories} cal/day
                </span>
                <span className="text-gray-600">{plan.totalCalories * 7} cal/week</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:w-3/5 relative mt-[49px]">
          <div className="flex flex-row items-center justify-between mb-8">
            <div className="flex gap-4 items-center">
              {/* <div className="w-16 h-16 rounded-full overflow-hidden">
                <img
                  src={influencer.imageUrl}
                  className="w-full h-full object-cover"
                  alt={influencer.name}
                />
              </div> */}
              <div>
                <h2 className="font-bold text-lg">{influencer.name}</h2>
                {influencer.socialMediaHandles[0].platform === "instagram" && 
                  <a 
                    href={`https://www.instagram.com/${influencer.socialMediaHandles[0].handle}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-gray-600"
                  >
                    @{influencer.socialMediaHandles[0].handle}
                  </a>
                }
              </div>
            </div>
            <div className="flex flex-row gap-4">
              <button 
                onClick={() => navigate(`/influencer/${influencerId}/mealplans`)}
                className="flex items-center gap-2 border-2 border-[#09C274] text-[#09C274] px-4 py-2 rounded-full font-semibold hover:bg-[#09C274] hover:text-white transition-colors"
              >
                More Plans
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M3.1064 2.5173C2.61817 2.5173 2.22238 2.12151 2.22238 1.63328C2.22238 1.14506 2.61817 0.749268 3.1064 0.749268H16.3667C16.8549 0.749268 17.2507 1.14506 17.2507 1.63328V14.8935C17.2507 15.3818 16.8549 15.7776 16.3667 15.7776C15.8784 15.7776 15.4826 15.3818 15.4826 14.8935V3.76749L2.25813 16.992C1.9129 17.3372 1.35318 17.3372 1.00795 16.992C0.662716 16.6468 0.662716 16.087 1.00795 15.7418L14.2325 2.5173H3.1064Z" fill="#09C274"/>
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M2.14035 1.63327C2.14035 1.09948 2.57308 0.666748 3.10688 0.666748H16.3671C16.9009 0.666748 17.3337 1.09948 17.3337 1.63327V14.8935C17.3337 15.4273 16.9009 15.8601 16.3671 15.8601C15.8333 15.8601 15.4006 15.4273 15.4006 14.8935V3.96667L2.31695 17.0503C1.9395 17.4278 1.32753 17.4278 0.950081 17.0503C0.572629 16.6729 0.572629 16.0609 0.950081 15.6835L14.0337 2.5998H3.10688C2.57308 2.5998 2.14035 2.16707 2.14035 1.63327ZM3.10688 0.831765C2.66422 0.831765 2.30537 1.19061 2.30537 1.63327C2.30537 2.07593 2.66422 2.43478 3.10688 2.43478H14.2329C14.2663 2.43478 14.2964 2.45488 14.3092 2.48572C14.3219 2.51655 14.3149 2.55204 14.2913 2.57563L1.06677 15.8001C0.753757 16.1131 0.753756 16.6206 1.06677 16.9336C1.37977 17.2467 1.88726 17.2467 2.20027 16.9336L15.4248 3.70914C15.4484 3.68554 15.4839 3.67848 15.5147 3.69125C15.5455 3.70402 15.5656 3.73411 15.5656 3.76748V14.8935C15.5656 15.3362 15.9245 15.695 16.3671 15.695C16.8098 15.695 17.1686 15.3362 17.1686 14.8935V1.63327C17.1686 1.19061 16.8098 0.831765 16.3671 0.831765H3.10688Z" fill="#09C274"/>
                </svg>
              </button>
              <button 
                onClick={() => {
                  if (orders && orders.length > 0) {
                    navigate(`/recipe/${influencerId}/mealplan/0`);
                  } else {
                    toast.error("Please order this meal plan to view recipes!");
                  }
                }}
                className={`flex items-center gap-2 border-2 px-4 py-2 rounded-full font-semibold transition-colors ${
                  orders && orders.length > 0 
                    ? "border-[#09C274] text-[#09C274] hover:bg-[#09C274] hover:text-white"
                    : "border-gray-300 text-gray-300 cursor-not-allowed"
                }`}
              >
                View Recipes
                {orders && orders.length > 0 ? (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M3.1064 2.5173C2.61817 2.5173 2.22238 2.12151 2.22238 1.63328C2.22238 1.14506 2.61817 0.749268 3.1064 0.749268H16.3667C16.8549 0.749268 17.2507 1.14506 17.2507 1.63328V14.8935C17.2507 15.3818 16.8549 15.7776 16.3667 15.7776C15.8784 15.7776 15.4826 15.3818 15.4826 14.8935V3.76749L2.25813 16.992C1.9129 17.3372 1.35318 17.3372 1.00795 16.992C0.662716 16.6468 0.662716 16.087 1.00795 15.7418L14.2325 2.5173H3.1064Z" fill="currentColor"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M2.14035 1.63327C2.14035 1.09948 2.57308 0.666748 3.10688 0.666748H16.3671C16.9009 0.666748 17.3337 1.09948 17.3337 1.63327V14.8935C17.3337 15.4273 16.9009 15.8601 16.3671 15.8601C15.8333 15.8601 15.4006 15.4273 15.4006 14.8935V3.96667L2.31695 17.0503C1.9395 17.4278 1.32753 17.4278 0.950081 17.0503C0.572629 16.6729 0.572629 16.0609 0.950081 15.6835L14.0337 2.5998H3.10688C2.57308 2.5998 2.14035 2.16707 2.14035 1.63327ZM3.10688 0.831765C2.66422 0.831765 2.30537 1.19061 2.30537 1.63327C2.30537 2.07593 2.66422 2.43478 3.10688 2.43478H14.2329C14.2663 2.43478 14.2964 2.45488 14.3092 2.48572C14.3219 2.51655 14.3149 2.55204 14.2913 2.57563L1.06677 15.8001C0.753757 16.1131 0.753756 16.6206 1.06677 16.9336C1.37977 17.2467 1.88726 17.2467 2.20027 16.9336L15.4248 3.70914C15.4484 3.68554 15.4839 3.67848 15.5147 3.69125C15.5455 3.70402 15.5656 3.73411 15.5656 3.76748V14.8935C15.5656 15.3362 15.9245 15.695 16.3671 15.695C16.8098 15.695 17.1686 15.3362 17.1686 14.8935V1.63327C17.1686 1.19061 16.8098 0.831765 16.3671 0.831765H3.10688Z" fill="currentColor"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 8V6C5 3.23858 7.23858 1 10 1C12.7614 1 15 3.23858 15 6V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M4 7H16V15C16 16.1046 15.1046 17 14 17H6C4.89543 17 4 16.1046 4 15V7Z" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-6 lg:absolute w-full">
            <div className="bg-[#4DE54A] rounded-xl p-6 min-h-[158px]">
              <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsPlanExpanded(!isPlanExpanded)}>
                <p className="text-gray-700 font-bold">About this plan</p>
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24"
                  className={`transition-transform ${isPlanExpanded ? 'rotate-180' : ''}`}
                >
                  <path 
                    d="M19 9l-7 7-7-7" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </div>
              {isPlanExpanded ? (
                <p className="text-gray-700 mt-4">
                  {influencer.mealPlans[Number(planIndex)].description}
                </p>
              ) : <p className="text-gray-700 mt-4">
                {influencer.mealPlans[Number(planIndex)].description.slice(0, 230)}...
              </p> }
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#F2F6FB] rounded-xl p-6 lg:mt-16">
        <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsBioExpanded(!isBioExpanded)}>
          <p className="text-gray-700 font-bold">About {influencer.name}</p>
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24"
            className={`transition-transform ${isBioExpanded ? 'rotate-180' : ''}`}
          >
            <path 
              d="M19 9l-7 7-7-7" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
        {isBioExpanded ? (
          <p className="text-gray-700 mt-4">
            {influencer.bio}
          </p>
        ) : <p className="text-gray-700 mt-4">
          {influencer.bio.slice(0, 230)}...
        </p> }
      </div>

      <div className="bg-white rounded-xl p-6 pl-0 pr-0 overflow-x-auto">
        <div className="flex gap-4 min-w-max">
          <div className="flex flex-col">
            <div className="bg-[#09C274] rounded-lg p-4 flex flex-col w-[240px] h-[150px]">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-white">Calories</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.5 2C7.5 2 4 5.5 4 8.5C4 10.433 5.567 12 7.5 12C9.433 12 11 10.433 11 8.5C11 5.5 7.5 2 7.5 2ZM7.5 3.5C7.5 3.5 9 5.5 9 7C9 7.82843 8.32843 8.5 7.5 8.5C6.67157 8.5 6 7.82843 6 7C6 5.5 7.5 3.5 7.5 3.5Z" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="mt-auto">
                <p className="text-xs text-[#E8ECED]">Average</p>
                <p className="font-semibold text-xs text-white">{plan.totalCalories || "4,000"}kcal/day</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="bg-[#F2F6FB] rounded-lg p-4 flex flex-col w-[240px] h-[150px]">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-900">Carbs</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 3C8 3 9 4 9 5C9 6 8 7 8 7M8 7C8 7 7 6 7 5C7 4 8 3 8 3M8 7V13M4 5C4 5 5 6 5 7C5 8 4 9 4 9M4 9C4 9 3 8 3 7C3 6 4 5 4 5M4 9V13M12 5C12 5 13 6 13 7C13 8 12 9 12 9M12 9C12 9 11 8 11 7C11 6 12 5 12 5M12 9V13" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="mt-auto">
                <p className="text-xs text-[#7E847C]">Average</p>
                <p className="font-semibold text-xs text-gray-900">{plan?.menuItems?.reduce((total, item) => total + (item?.macros?.carbs || 0), 0) || "300"}g/day</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="bg-[#4DE54A] rounded-lg p-4 flex flex-col w-[240px] h-[150px]">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-900">Proteins</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 4C13 5.65685 10.3137 7 7 7C3.68629 7 1 5.65685 1 4M13 4C13 2.34315 10.3137 1 7 1C3.68629 1 1 2.34315 1 4M13 4V8C13 9.65685 10.3137 11 7 11C3.68629 11 1 9.65685 1 8V4" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M13 8V12C13 13.6569 10.3137 15 7 15C3.68629 15 1 13.6569 1 12V8" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="mt-auto">
                <p className="text-xs text-[#7E847C]">Average</p>
                <p className="font-semibold text-xs text-gray-900">{plan?.menuItems?.reduce((total, item) => total + (item?.macros?.protein || 0), 0) || "300"}g/day</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="bg-[#D9D6FF] rounded-lg p-4 flex flex-col w-[240px] h-[150px]">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-900">Fats</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 6C4 4.34315 5.34315 3 7 3C8.65685 3 10 4.34315 10 6C10 7.65685 8.65685 9 7 9M7 9C5.34315 9 4 10.3431 4 12C4 13.6569 5.34315 15 7 15C8.65685 15 10 13.6569 10 12C10 10.3431 8.65685 9 7 9ZM7 9V6M12 4C12 2.89543 11.1046 2 10 2C8.89543 2 8 2.89543 8 4C8 5.10457 8.89543 6 10 6C11.1046 6 12 5.10457 12 4Z" stroke="#ff6d3f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="mt-auto">
                <p className="text-xs text-[#7E847C]">Average</p>
                <p className="font-semibold text-xs text-gray-900">{plan?.menuItems?.reduce((total, item) => total + (item?.macros?.fat || 0), 0) || "300"}g/day</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="block">
        <div key={planIndex} className="mb-12">
          <p className="text-md font-bold">Possible allergens</p>
          <p className="text-sm mb-4">Eggs, Soy</p>
          <p className="text-sm mb-4 text-[#09C274] flex flex-row items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.43735 1.5C5.27359 1.50308 3.63666 1.55969 2.59817 2.59817C1.55969 3.63666 1.50308 5.27359 1.5 8.43735H5.18514C4.92191 8.10855 4.72523 7.72072 4.61798 7.29171C4.21429 5.67694 5.67694 4.21429 7.29171 4.61798C7.72072 4.72523 8.10855 4.92191 8.43735 5.18514V1.5Z" fill="#09C274"/>
            <path d="M1.5 9.5625C1.50308 12.7262 1.55969 14.3631 2.59817 15.4016C3.63666 16.4401 5.27359 16.4967 8.43735 16.4998V10.5927C7.85257 11.7607 6.64485 12.5625 5.24982 12.5625C4.93916 12.5625 4.68732 12.3106 4.68732 12C4.68732 11.6893 4.93916 11.4375 5.24982 11.4375C6.40241 11.4375 7.36816 10.6375 7.6221 9.5625H1.5Z" fill="#09C274"/>
            <path d="M9.5625 16.4998C12.7262 16.4967 14.3631 16.4401 15.4016 15.4016C16.4401 14.3631 16.4967 12.7262 16.4998 9.5625H10.3777C10.6316 10.6375 11.5974 11.4375 12.75 11.4375C13.0606 11.4375 13.3125 11.6893 13.3125 12C13.3125 12.3106 13.0606 12.5625 12.75 12.5625C11.3549 12.5625 10.1472 11.7607 9.5625 10.5927V16.4998Z" fill="#09C274"/>
            <path d="M16.4998 8.43735C16.4967 5.27359 16.4401 3.63666 15.4016 2.59817C14.3631 1.55969 12.7262 1.50308 9.5625 1.5V5.18514C9.8913 4.92191 10.2791 4.72523 10.708 4.61798C12.3229 4.21429 13.7855 5.67694 13.3818 7.29171C13.2745 7.72072 13.0779 8.10855 12.8147 8.43735H16.4998Z" fill="#09C274"/>
            <path d="M7.01847 5.70949C7.85211 5.9179 8.43696 6.66693 8.43696 7.5262V8.43745H7.52571C6.66645 8.43745 5.91741 7.8526 5.709 7.01895C5.5113 6.22812 6.22764 5.51178 7.01847 5.70949Z" fill="#09C274"/>
            <path d="M9.5625 7.5262V8.43745H10.4737C11.3329 8.43745 12.082 7.8526 12.2904 7.01895C12.4881 6.22812 11.7718 5.51178 10.981 5.70949C10.1473 5.9179 9.5625 6.66693 9.5625 7.5262Z" fill="#09C274"/>
                  </svg>
            Re-order this plan next week to customize items!
          </p>
          <p className="text-md font-bold mb-4">Here are a few items you'll be getting in this meal plan!</p>
          <>
            <div className="grid grid-cols-3 md:grid-cols-3 xs:grid-cols-3 gap-4 mb-6">
              {plan.menuItems.sort(randValue).slice(0, 3).map((menuItem) => (
                <MenuItem
                  key={menuItem._id}
                  menuItem={menuItem}
                />
              ))}
            </div>

                <button 
              // onClick={handleCreateOrder}
              onClick={() => setIsOrderPage(true)}
              className="mt-4 bg-[#09C274] text-white px-4 py-3 rounded-xl w-full font-medium flex flex-row items-center justify-center gap-2 rounded-xl"
            >
              <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M3.55153 2.04491C3.1402 1.90029 2.68952 2.11651 2.54491 2.52783C2.40029 2.93916 2.61651 3.38984 3.02783 3.53445L3.30278 3.63112C4.00552 3.87819 4.46736 4.04193 4.8072 4.20867C5.12637 4.36528 5.26708 4.49205 5.35977 4.62769C5.45478 4.76673 5.52815 4.9577 5.56955 5.34017C5.61287 5.74039 5.61395 6.26165 5.61395 7.04054V9.77912H22.1656C22.5135 8.03435 22.6767 7.14801 22.2205 6.55503C21.7533 5.94758 20.1566 5.94758 18.3831 5.94758H7.18503C7.17799 5.66303 7.16464 5.40415 7.13931 5.17025C7.08276 4.64775 6.96022 4.17121 6.6634 3.73686C6.36427 3.29912 5.96653 3.01876 5.50272 2.79118C5.06894 2.57834 4.51776 2.38458 3.86879 2.15644L3.55153 2.04491Z" fill="white"/>
                <path opacity="0.5" d="M21.614 12.4604L22.1401 9.90802L22.1659 9.77881H5.61426C5.61426 12.8752 5.68083 13.897 6.59282 14.859C7.50481 15.8209 8.97263 15.8209 11.9083 15.8209H17.4902C19.1334 15.8209 19.955 15.8209 20.5357 15.3476C21.1165 14.8743 21.2823 14.0696 21.614 12.4604Z" fill="white"/>
                <path d="M8.24592 18.5791C9.11795 18.5791 9.82485 19.286 9.82485 20.158C9.82485 21.03 9.11795 21.737 8.24592 21.737C7.3739 21.737 6.66699 21.03 6.66699 20.158C6.66699 19.286 7.3739 18.5791 8.24592 18.5791Z" fill="white"/>
                <path d="M17.7196 18.5791C18.5915 18.5791 19.2985 19.2859 19.2985 20.158C19.2985 21.03 18.5915 21.737 17.7196 21.737C16.8476 21.737 16.1406 21.03 16.1406 20.158C16.1406 19.2859 16.8476 18.5791 17.7196 18.5791Z" fill="white"/>
              </svg>
              Order plan!
            </button>
          </>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
};

export default MealPlanDetailPage;
