/* eslint-disable */
import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
// import { Influencer, MenuItem as MenuItemType } from "@/types";
import { Influencer } from "@/types";
import { Card } from "@/components/ui/card";
import MenuItem from "@/components/MenuItem";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchGroceryStores, useStoreInventory, useFitbiteInventory } from "@/api/GroceryApi";
import PaymentMethodSection from "@/components/PaymentMethodSection";
// import { ShoppingListItemType } from '../types/grocery';
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import QuoteDetails from "@/components/QuoteMealMe";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const fetchInfluencerById = async (id: string): Promise<Influencer> => {
  const response = await fetch(`${API_BASE_URL}/api/influencer/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch influencer");
  }
  return response.json();
};

interface ShoppingListItem {
  product_id: string;
  name: string;
  quantity: number;
  product_marked_price: number;
  selected_options?: Array<{
    option_id: string;
    quantity: number;
    marked_price?: number;
    notes?: string;
  }>;
}

const MealPlanDetailPage = () => {
  const { influencerId, planIndex } = useParams();
  const [selectedDeliveryDate, setSelectedDeliveryDate] = useState<string | null>(null);
  const [selectedStartDay, setSelectedStartDay] = useState<string | null>("Mon");
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [isPlanExpanded, setIsPlanExpanded] = useState(false);
  const [isOrderPage, setIsOrderPage] = useState(false);
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [isStoresExpanded, setIsStoresExpanded] = useState(false);
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [location, setLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const navigate = useNavigate();
  const randValue = () => Math.random() - 0.5;
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [streetNum, setStreetNum] = useState<string>("");
  const [streetName, setStreetName] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [zipcode, setZipcode] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [specialInstructions, setSpecialInstructions] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [pickup, setPickup] = useState(false);
  const [sort, setSort] = useState('relevance');
  const [searchFocus, setSearchFocus] = useState('store');
  const [query, setQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [quote, setQuote] = useState<any>(null);

  console.log(errorMessage, 'errorMessage found here');

  const { data: influencer, isLoading, error } = useQuery(
    ["fetchInfluencer", influencerId],
    () => fetchInfluencerById(influencerId as string),
    {
      enabled: !!influencerId,
    }
  );

  const plan = influencer?.mealPlans[Number(planIndex) || 0];

  const { data: storeMatches } = useSearchGroceryStores({
    latitude: location?.latitude || 0,
    longitude: location?.longitude || 0,
    open,
    pickup,
    sort,
    user_street_num: streetNum,
    user_street_name: streetName,
    user_city: city,
    user_state: state,
    user_zipcode: zipcode,
    user_country: country,
    search_focus: searchFocus,
    query
  });

  // useEffect(() => {
  //   // Re-call the search stores endpoint when options change
  //   refetch();
  // }, [open, pickup, sort, searchFocus, query, location, refetch]);

  const { data: inventory, isLoading: inventoryLoading, refetch: refetchInventory } = useStoreInventory({
    store_id: selectedStore?._id,
    ...(selectedCategory?.subcategory_id && { subcategory_id: selectedCategory.subcategory_id }),
    latitude: location?.latitude || 0,
    longitude: location?.longitude || 0,
    user_street_num: streetNum,
    user_street_name: streetName,
    user_city: city,
    user_state: state,
    user_zipcode: zipcode,
    user_country: country
  });

  const { data: fitbiteInventory, refetch: fetchFitbiteInventory } = useFitbiteInventory(
    selectedStore?._id, // Initial empty storeId
    plan?.menuItems || [] // Initial empty menuItems
  );

  useEffect(() => {
    if (inventory && !selectedCategory) {
      setQuote(inventory.quote);
    }
  }, [inventory, selectedCategory]);

  const handleStoreSelection = async (store: any) => {
    setSelectedStore(store);
    setSelectedCategory(null); // Reset category selection when switching stores

    try {
      const response = await fetch(`${API_BASE_URL}/api/grocery/process-inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          store_id: store._id,
          latitude: location?.latitude || 0,
          longitude: location?.longitude || 0,
          user_street_num: streetNum,
          user_street_name: streetName,
          user_city: city,
          user_state: state,
          user_zipcode: zipcode,
          user_country: country
        })
      });

      if (!response.ok) {
        throw new Error('Failed to queue inventory processing');
      }

      console.log('Inventory processing job added to the queue');
    } catch (error) {
      console.error('Error queuing inventory processing:', error);
    }
  };
  // const { data: storeMatches } = useFindStoresForShoppingList({
  //   menuItems: plan?.menuItems || [],
  //   latitude: location?.latitude || 0,
  //   longitude: location?.longitude || 0,
  // });

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
  useEffect(() => {
    const updateLocation = async () => {
      if (areDeliveryDetailsComplete()) {
        const address = `${streetNum} ${streetName}, ${city} ${state} ${country}, ${zipcode}`;
        const coordinates = await fetchCoordinates(address);
        if (coordinates) {
          setLocation({
            latitude: coordinates.lat,
            longitude: coordinates.lng
          });
        }
      }
    };

    updateLocation();
  }, [streetNum, streetName, city, state, zipcode, country]);

  console.log(" --------- ");
  console.log(plan);
  console.log(planIndex);
  console.log(influencer);

  if (!plan) {
    return <div>No meal plan found</div>;
  }

  if (isLoading) {
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
        product_id: item.id,
        name: item.name,
        quantity: 1,
        product_marked_price: Math.round(item.price * 100), // Convert to cents
        selected_options: [] // Add options if available from the API
      };

      return [...prevList, newItem];
    });
  };

  const removeFromShoppingList = (productId: string) => {
    setShoppingList(prevList => prevList.filter(item => item.product_id !== productId));
  };

  const calculateSubtotal = () => {
    return shoppingList.reduce((total, item) => {
      const itemTotal = (item.product_marked_price * item.quantity);
      return total + itemTotal;
    }, 0);
  };

  const calculateTax = (subtotal: number) => {
    const TAX_RATE = 0.08; // 8% tax rate - adjust as needed
    return Math.round(subtotal * TAX_RATE);
  };

  const calculateShipping = () => {
    // You can implement dynamic shipping logic here
    const BASE_SHIPPING = 500; // $5.00 in cents
    return BASE_SHIPPING;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    const shipping = calculateShipping();
    return subtotal + tax + shipping;
  };

  const handleCreateOrder = async () => {
    if (!selectedStore || !location) {
      console.error("Store or location not selected");
      return;
    }

    const deliveryDetails = {
      address: `${streetNum} ${streetName}, ${city} ${state} ${country}, ${zipcode}`,
      latitude: location.latitude,
      longitude: location.longitude,
      street_num: streetNum,
      street_name: streetName,
      city: city,
      state: state,
      zipcode: zipcode,
      country: country,
      instructions: specialInstructions,
      tip_amount: tipAmount
    };

    const orderData = {
      store_id: selectedStore._id,
      items: shoppingList.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        instructions: "" // Add any special instructions if needed
      })),
      delivery_details: deliveryDetails,
      payment_details: {
        payment_method_id: selectedPaymentMethod,
        payment_amount: calculateTotal()
      },
      place_order: true,
      final_quote: false // Adjust as needed
    };

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
        // Open the tracking link in a new tab
        window.open(data.tracking_link, '_blank');
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
    return streetNum && streetName && city && state && zipcode && country && email;
  };

  console.log(fitbiteInventory, 'fitbiteInventory')

  const handleOrderPlan = async (store: any) => {
    console.log("storeId", store);
    setSelectedStore(store);
    if (!plan || !plan.menuItems) {
      console.error("No meal plan or menu items found");
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms

    try {
      // Update query parameters and refetch
      // const result = await fetchFitbiteInventory();
      const queryParams = new URLSearchParams({
        store_id: store._id,
        items: JSON.stringify(plan.menuItems)
      });
      const response = await fetch(
        `${API_BASE_URL}/api/grocery/fitbite-inventory?${queryParams}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch fitbite inventory');
      }

      const result = await response.json();
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms

      if (result) {
        console.log("Fitbite inventory fetched successfully:", result);
        // Handle success (e.g., navigate to a new page or show a success message)
        // setShoppingList(result.data);
        setShoppingList(result.matches
          .filter((item: any) => item.price && item.price > 0)
          .map((item: any) => ({
            product_id: item.product_id,
            name: item.name,
            quantity: 1,
            product_marked_price: Math.round(item.price * 100), // Convert to cents
            selected_options: [] // Add options if available from the API
          })));
        
        console.log(shoppingList, 'shoppingList')
      }
    } catch (error) {
      console.error("Error fetching fitbite inventory:", error);
      toast.error("Failed to fetch fitbite inventory");
    }
  };

  if (isOrderPage) {
    return (
      <div className="flex flex-col lg:flex-row mt-[40px]">
        <div className="flex lg:w-3/4 flex-col gap-4 bg-white p-3 rounded-md" style={{ borderRadius: '24px 24px 0 0' }}>
          <div className="flex flex-row items-center gap-2 md:px-32 cursor-pointer" onClick={() => setIsOrderPage(false)}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M15.8936 3.5173C16.3818 3.5173 16.7776 3.12151 16.7776 2.63328C16.7776 2.14506 16.3818 1.74927 15.8936 1.74927H2.63334C2.14511 1.74927 1.74933 2.14506 1.74933 2.63328V15.8935C1.74933 16.3818 2.14511 16.7776 2.63334 16.7776C3.12157 16.7776 3.51736 16.3818 3.51736 15.8935V4.76749L16.7419 17.992C17.0871 18.3372 17.6468 18.3372 17.9921 17.992C18.3373 17.6468 18.3373 17.087 17.9921 16.7418L4.76755 3.5173H15.8936Z" fill="black"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M16.8596 2.63327C16.8596 2.09948 16.4269 1.66675 15.8931 1.66675H2.63286C2.09907 1.66675 1.66634 2.09948 1.66634 2.63327V15.8935C1.66634 16.4273 2.09907 16.8601 2.63286 16.8601C3.16666 16.8601 3.59939 16.4273 3.59939 15.8935V4.96667L16.683 18.0503C17.0605 18.4278 17.6725 18.4278 18.0499 18.0503C18.4274 17.6729 18.4274 17.0609 18.0499 16.6835L4.96626 3.5998H15.8931C16.4269 3.5998 16.8596 3.16707 16.8596 2.63327ZM15.8931 1.83176C16.3358 1.83176 16.6946 2.19061 16.6946 2.63327C16.6946 3.07593 16.3358 3.43478 15.8931 3.43478H4.76707C4.7337 3.43478 4.70361 3.45488 4.69084 3.48572C4.67807 3.51655 4.68513 3.55204 4.70873 3.57563L17.9332 16.8001C18.2462 17.1131 18.2462 17.6206 17.9332 17.9336C17.6202 18.2467 17.1127 18.2467 16.7997 17.9336L3.57522 4.70914C3.55163 4.68554 3.51614 4.67848 3.48531 4.69125C3.45448 4.70402 3.43437 4.73411 3.43437 4.76748V15.8935C3.43437 16.3362 3.07553 16.695 2.63286 16.695C2.1902 16.695 1.83136 16.3362 1.83136 15.8935V2.63327C1.83136 2.19061 2.1902 1.83176 2.63286 1.83176H15.8931Z" fill="black"/>
            </svg>
            <p>Back</p>
          </div>
          <div className="bg-white rounded-xl relative">
            <div 
              className="flex justify-between items-center cursor-pointer p-4 md:px-32" 
              onClick={() => setIsMenuExpanded(!isMenuExpanded)}
            >
              <p className="text-md font-bold">Plan Items ({plan.menuItems.length})</p>
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
              <div className="grid grid-cols-3 md:grid-cols-3 xs:grid-cols-3 gap-4 p-4 md:px-32">
                {plan.menuItems.map((menuItem) => (
                  <MenuItem
                    key={menuItem._id}
                    menuItem={menuItem}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl relative">
            <div 
              className="flex justify-between items-center cursor-pointer p-4 md:px-32" 
              onClick={() => setIsStoresExpanded(!isStoresExpanded)}
            >
              <p className="text-md font-bold">Available at Stores Nearby</p>
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24"
                className={`transition-transform ${isStoresExpanded ? 'rotate-180' : ''}`}
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
            {isStoresExpanded && (
              <div className="p-4 md:px-32">
                <div className="space-y-4 mb-8">
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
                    <div className="overflow-x-auto">
                      <p className="text-gray-600 mb-4">Select a nearby store to search for your meal plan</p>
                      <div className="flex flex-row gap-4 pb-4" style={{minWidth: "min-content", height: "250px"}}>
                        {storeMatches.stores.map((store: any) => (
                          <div 
                            key={store?._id || 'unknown'} 
                            className={`flex-none w-80 p-4 rounded-lg cursor-pointer ${
                              selectedStore?.id === store.id ? 'bg-[#09C274] text-white' : 'bg-[#F2F6FB]'
                            }`}
                          >
                            <div>
                              <h4 className="font-medium">{store?.name || 'Unknown Store'}</h4>
                              <p className={`text-sm ${selectedStore?.id === store.id ? 'text-white' : 'text-gray-600'}`}>
                                {store?.address?.street_addr}, {store?.address?.city}
                              </p>
                            </div>
                            <div className="mt-2">
                              <p className="font-medium">
                                {(store?.miles ?? 0).toFixed(1)} mi
                              </p>
                              <div className="flex items-center gap-1">
                                <div className={`w-2 h-2 rounded-full ${store?.is_open ? 'bg-[#21ff00]' : 'bg-gray-500'}`}></div>
                                <p className={`text-sm ${selectedStore?.id === store.id ? 'text-white' : 'text-gray-600'}`}>
                                  {store?.is_open ? 'Open' : 'Closed'}
                                </p>
                              </div>
                            </div>
                            <button
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
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    {selectedStore && (
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
                    {!inventoryLoading && (
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

          <div className="px-2 md:px-32">
            <div className="space-y-4">
              <div className="bg-[#F2F6FB] rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3">Delivery</h3>
                <p className="text-gray-600 mb-4">Choose delivery time</p>
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
                  {/* <p className="text-gray-600 mb-4">Saved addresses</p>
                  <div className="flex flex-col divide-y">
                    <label className="flex items-center justify-between py-4">
                      <div>
                        <span className="font-medium">68 5 89th st</span>
                      </div>
                      <input 
                        type="radio" 
                        name="deliveryAddress"
                        value="68 5 89th st"
                        className="h-5 w-5 text-[#ff6d3f]"
                      />
                    </label>
                    <label className="flex items-center justify-between py-4">
                      <div className="flex items-center">
                        <span className="font-medium">New address</span>
                      </div>
                      <input
                        type="radio"
                        name="deliveryAddress" 
                        value="new"
                        className="h-5 w-5 text-[#ff6d3f]"
                      />
                    </label>
                  </div> */}

                  <h2 className="text-lg font-semibold mb-4">Delivery Details</h2>
                  <p className="text-gray-600 mb-4">Email</p>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 mb-3 focus:outline-none focus:ring-2 focus:ring-[#ff6d3f]"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Street Number"
                    value={streetNum}
                    onChange={(e) => setStreetNum(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 mb-3 focus:outline-none focus:ring-2 focus:ring-[#ff6d3f]"
                  />
                  <input
                    type="text"
                    placeholder="Street Name"
                    value={streetName}
                    onChange={(e) => setStreetName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 mb-3 focus:outline-none focus:ring-2 focus:ring-[#ff6d3f]"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 mb-3 focus:outline-none focus:ring-2 focus:ring-[#ff6d3f]"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 mb-3 focus:outline-none focus:ring-2 focus:ring-[#ff6d3f]"
                  />
                  <input
                    type="text"
                    placeholder="Zipcode"
                    value={zipcode}
                    onChange={(e) => setZipcode(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 mb-3 focus:outline-none focus:ring-2 focus:ring-[#ff6d3f]"
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 mb-3 focus:outline-none focus:ring-2 focus:ring-[#ff6d3f]"
                  />
                  <p className="text-gray-600 mb-4">Tip Amount</p>
                  <input
                    type="number"
                    placeholder="Tip Amount"
                    value={tipAmount}
                    onChange={(e) => setTipAmount(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 mb-3 focus:outline-none focus:ring-2 focus:ring-[#ff6d3f]"
                  />
                  <textarea
                    placeholder="Special Instructions"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 mb-3 focus:outline-none focus:ring-2 focus:ring-[#ff6d3f] min-h-[100px] resize-y"
                  />
                </div>
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

              <>
                <div className="grid grid-cols-3 md:grid-cols-3 xs:grid-cols-3 gap-4 mb-6">
                  {plan.menuItems.sort(randValue).slice(0, 3).map((menuItem) => (
                    <MenuItem
                      key={menuItem._id}
                      menuItem={menuItem}
                    />
                  ))}
                </div>

                <PaymentMethodSection 
                  email={email}
                  onPaymentMethodSelect={(paymentMethodId) => setSelectedPaymentMethod(paymentMethodId)} 
                />

                {/* <button 
                  onClick={handleCreateOrder}
                  disabled={!selectedPaymentMethod}
                  className={`mt-4 px-4 py-3 rounded-xl w-full font-medium ${
                    selectedPaymentMethod 
                      ? 'bg-[#09C274] text-white' 
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {selectedPaymentMethod ? 'Order this plan - $74.95' : 'Select a payment method to continue'}
                </button> */}
              </>

              {/* <div className="bg-[#F2F6FB] rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3">Payment</h3>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center">
                    <input type="radio" name="paymentMethod" className="mr-2" />
                    ApplePay <span className="text-sm text-gray-500 ml-2">Default</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="paymentMethod" className="mr-2" />
                    Visa ending in 2828
                  </label>
                </div>
              </div> */}

              <button 
                onClick={() => setIsOrderPage(false)}
                className="mt-4 bg-white border-2 border-[#09C274] text-[#09C274] px-4 py-3 rounded-xl w-full font-medium"
              >
                Back
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 bg-white p-4 rounded-md lg:w-1/4 lg:px-2 px-32">
          <div className="mb-6 -bottom-[61px] left-0 right-0">
            <div className="flex flex-col items-start gap-2 flex justify-start">
              <h2 className="text-lg font-bold">{plan.name}</h2>
              <div className="flex items-center gap-2">
                <span className="bg-[#D9D6FF] text-black px-4 py-2 rounded-full text-sm font-bold text-center min-w-[200px]">
                  {plan.totalCalories} cal/day
                </span>
                <span className="text-gray-500 text-sm text-center min-w-[150px]">
                  {plan.totalCalories * 7} cal/week
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {shoppingList?.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium mb-3">Shopping List</h3>
                <div className="space-y-2">
                  {shoppingList.map((item: any) => (
                    <div key={item.product_id} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="bg-gray-100 px-2 py-1 rounded">{item.quantity}</span>
                        <span>{item.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span>${((item.product_marked_price * item.quantity) / 100).toFixed(2)}</span>
                        <button 
                          onClick={() => removeFromShoppingList(item.product_id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${(calculateSubtotal() / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Taxes</span>
              <span>${(calculateTax(calculateSubtotal()) / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span>${(calculateShipping() / 100).toFixed(2)}</span>
            </div>
            <div className="h-[1px] bg-gray-200 my-2"></div>
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>${(calculateTotal() / 100).toFixed(2)}</span>
            </div>
          </div>
          <button 
            className={`mt-4 px-4 py-3 rounded-xl w-full font-medium ${
              shoppingList.length > 0 
                ? 'bg-[#09C274] text-white hover:bg-[#07b369] transition-colors' 
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
            disabled={shoppingList.length === 0}
            onClick={handleCreateOrder}
          >
            {shoppingList.length > 0 
              ? `Review Order - $${(calculateTotal() / 100).toFixed(2)}`
              : 'Add items to cart'
            }
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 bg-white p-3 rounded-md mt-[80px] lg:p-6 lg:max-w-10xl lg:mx-auto lg:mt-8">
      <div className="block lg:hidden">
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
      </div>

      <div className="hidden lg:flex lg:flex-row lg:gap-8">
        <div className="w-2/3">
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

        <div className="w-1/3 relative">
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
            <button 
              onClick={() => navigate(`/influencer/${influencerId}/mealplans`)}
              className="flex items-center gap-2 border-2 border-[#09C274] text-[#09C274] px-4 py-2 rounded-full font-semibold hover:bg-[#09C274] hover:text-white transition-colors"
            >
              More Plans
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 18L6 6M6 6H18M6 6V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <div className="space-y-6 absolute">
            <div className="bg-[#4DE54A] rounded-xl p-6">
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
          </div>
        </div>
      </div>

      <div className="bg-[#F2F6FB] rounded-xl p-6 mt-16">
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
        {isPlanExpanded && (
          <p className="text-gray-700 mt-4">
            {influencer.mealPlans[Number(planIndex)].description}
          </p>
        )}
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
                <p className="text-xs text-[#7E847C]">Average</p>
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

          <div className="flex flex-col">
            <div className="bg-[#F2F6FB] rounded-lg p-4 flex flex-col w-[240px] h-[150px]">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-900">Sugars</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 4.5L8 2L3 4.5V11.5L8 14L13 11.5V4.5Z" stroke="#ff6d3f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 4.5L8 7L13 4.5" stroke="#ff6d3f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 14V7" stroke="#ff6d3f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="mt-auto">
                <p className="text-xs text-[#7E847C]">Average</p>
                <p className="font-semibold text-xs text-gray-900">- g/day</p>
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
              className="mt-4 bg-[#09C274] text-white px-4 py-3 rounded-xl w-full font-medium"
            >
              Order this plan - $74.95
            </button>
          </>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
};

export default MealPlanDetailPage;
