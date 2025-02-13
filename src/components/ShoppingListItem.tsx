import { useState, useRef, useEffect } from 'react';
import { ShoppingListItem } from '@/types';
import MatchedItem from './matchedItem';

interface ShoppingListProps {
  shoppingList: ShoppingListItem[];
//   onRemoveItem: (id: string) => void;
  tipAmount: number;
  handleCreateOrder: (total: number, activeMatchedItems: any, quantities: any) => void;
  initialMatchedItems: any;
  setInitialMatchedItems: any;
  initialQuantities: any;
  setInitialQuantities: any;
//   saveShoppingListConfig: any;
  selectedStoreId: string;
  selectedStore: any;
}

const ShoppingListComponent = ({ shoppingList, tipAmount, handleCreateOrder,
    initialMatchedItems, setInitialMatchedItems, initialQuantities, setInitialQuantities, selectedStoreId, selectedStore }: ShoppingListProps) => {
      console.log(setInitialMatchedItems, 'setInitialMatchedItems in ShoppingListComponent')
  const [activeMatchedItems, setActiveMatchedItems] = useState<{[key: string]: any}>(initialMatchedItems);
  const [selectedItem, setSelectedItem] = useState<ShoppingListItem | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [imagePopup, setImagePopup] = useState<any>({ visible: false, item: null });
  const [quantities, setQuantities] = useState<{[key: string]: number}>(initialQuantities);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const deliveryFee = selectedStore?.quotes?.cheapest_delivery?.delivery_fee?.delivery_fee_flat / 100 || 0; // Convert cents to dollars
  const [activeUnit, setActiveUnit] = useState<{ [key: string]: number }>({});

  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleToggleUnit = (itemId: string, index: number) => {
    setActiveUnit(prev => ({
      ...prev,
      [itemId]: index
    }));
  };  

  const saveShoppingList = () => {
    const listData = {
      shoppingList,
      activeMatchedItems,
      quantities,
    };
    const influencerId = 'someInfluencerId'; // Replace with actual influencer ID
    const key = `shoppingList_${influencerId}_${selectedStoreId}`;
    localStorage.setItem(key, JSON.stringify(listData));
    console.log('Shopping list saved');
  };

  // Function to load the shopping list from local storage
  const loadShoppingList = () => {
    const influencerId = 'someInfluencerId'; // Replace with actual influencer ID
    const key = `shoppingList_${influencerId}_${selectedStoreId}`;
    const savedList = localStorage.getItem(key);
    console.log(savedList, 'savedList in load');
    console.log(shoppingList, 'shoppingList in load');
    if (savedList) {
      const { shoppingList: savedShoppingList, activeMatchedItems, quantities } = JSON.parse(savedList);
      console.log(activeMatchedItems, 'activeMatchedItems in load');
      console.log(savedShoppingList, 'savedShoppingList in load');
      setActiveMatchedItems(activeMatchedItems);
      setQuantities(quantities);
      console.log('Shopping list loaded');
    }
  };

  useEffect(() => {
    loadShoppingList();
  }, [selectedStore]);

  const handleMatchedItemClick = (shoppingItemId: string, matchedItem: any) => {
    setActiveMatchedItems(prev => ({
      ...prev,
      [shoppingItemId]: matchedItem
    }));

    console.log(activeMatchedItems, 'activeMatchedItems in handleMatchedItemClick')

    // setInitialMatchedItems(activeMatchedItems);

    // Find the next unmatched item
    const currentIndex = shoppingList.findIndex(item => item.product_id === shoppingItemId);
    const nextUnmatchedItem = shoppingList.slice(currentIndex + 1).find(item => !activeMatchedItems[item.product_id]);

    if (nextUnmatchedItem) {
      setSearchResults([]);
      setSelectedItem(nextUnmatchedItem);
      setSearchQuery(nextUnmatchedItem.searchTerm || nextUnmatchedItem.name);
      handleSearchChange({ target: { value: nextUnmatchedItem.searchTerm || nextUnmatchedItem.name } });
    } else {
      setShowPopup(false);
    }
  };

  const handleItemClick = (item: ShoppingListItem) => {
    console.log(item, 'item in handleItemClick')
    setSearchResults([]);
    setSelectedItem(item);
    setSearchQuery(item.searchTerm);
    setShowPopup(true);
    handleSearchChange({ target: { value: item.searchTerm } });
  };

  const handleUpdateQuantity = (matchId: string, change: number) => {
    setQuantities(prev => {
      const currentQty = prev[matchId] || 1;
      const newQty = Math.max(1, currentQty + change);
      return {
        ...prev,
        [matchId]: newQty
      };
    });

    setInitialQuantities(quantities);
  };

  const calculateSubtotal = () => {
    return shoppingList.reduce((total, item) => {
      const activeMatch = activeMatchedItems[item.product_id];
      if (activeMatch) {
        const quantity = quantities[activeMatch._id] || 1;
        const itemTotal = activeMatch.price * quantity;
        return total + (itemTotal * 100);
      }
      return total;
    }, 0);
  };

  const calculateTax = (subtotal: number) => {
    const TAX_RATE = 0.08;
    return Math.round(subtotal * TAX_RATE);
  };

  const calculateShipping = () => {
    const BASE_SHIPPING = 2000;
    return BASE_SHIPPING;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    // const deliveryFee = selectedStore.quotes.cheapest_delivery.delivery_fee.delivery_fee_flat / 100; // Convert cents to dollars
    const tax = calculateTax(subtotal);
    const shipping = calculateShipping();
    const total = subtotal + tax + shipping + (tipAmount * 100) + deliveryFee;
    return total;
  };

  const getCurrentItemIndex = () => {
    if (!selectedItem) return 0;
    return shoppingList.findIndex(item => item.product_id === selectedItem.product_id) + 1;
  };

  const handlePrevItem = () => {
    if (!selectedItem) return;
    const currentIndex = shoppingList.findIndex(item => item.product_id === selectedItem.product_id);
    if (currentIndex > 0) {
      setSelectedItem(shoppingList[currentIndex - 1]);
      setSearchResults([]);
      setSearchQuery(shoppingList[currentIndex - 1].name);
      handleSearchChange({ target: { value: shoppingList[currentIndex - 1].name } });
    }
  };

  const handleNextItem = () => {
    if (!selectedItem) return;
    const currentIndex = shoppingList.findIndex(item => item.product_id === selectedItem.product_id);
    if (currentIndex < shoppingList.length - 1) {
      setSearchResults([]);
      setSelectedItem(shoppingList[currentIndex + 1]);
      setSearchQuery(shoppingList[currentIndex + 1].name);
      handleSearchChange({ target: { value: shoppingList[currentIndex + 1].name } });
    }
  };

  const handleImageClick = (item: ShoppingListItem, matchedItem: any) => {
    setImagePopup({ visible: true, item: { ...item, matchedItem } });
  };

  const closeImagePopup = () => {
    setImagePopup({ visible: false, item: null });
  };

  const handleRemoveMatchedItem = (itemId: string) => {
    setActiveMatchedItems(prev => {
      const updated = { ...prev };
      delete updated[itemId];
      return updated;
    });
  };

  const handleSearchChange = (e: any) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (query.length > 3) { // Start searching after 3 characters
      searchTimeout.current = setTimeout(async () => {
        try {
          const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
          const response = await fetch(`${API_BASE_URL}/api/inventory/search?query=${query}&store_id=${selectedStoreId}`);
          const results = await response.json();
          setSearchResults(results);
        } catch (error) {
          console.error('Error fetching search results:', error);
        }
      }, 1000); // 2 seconds delay
    } else {
      setSearchResults([]);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="mb-6 bg-[#F2F6FB] rounded-lg p-4">
        {/* <h3 className="font-medium mb-3">Shopping List</h3> */}
        <div className="flex flex-col justify-between items-start mb-3">
          <h3 className="font-medium mb-4">Cart ({shoppingList.length})</h3>
          <p>Click "match" to find item equivalents in your store.</p>
        </div>
        <div className="space-y-2">
          {shoppingList.map((item) => {
            const activeMatch = activeMatchedItems[item.product_id] || null;
            
            return (
              <div key={item._id} className="flex flex-col gap-2 py-2">
                <div 
                  className={`flex flex-col justify-between items-center cursor-pointer ${activeMatch ? 'border border-[#09C274] rounded-lg p-2' : ''}`}
                  onClick={() => handleItemClick(item)}
                >
                  { activeMatch ? <div className="flex items-center justify-between w-full flex-row w-full text-gray-500">
                      <span className="font-medium truncate max-w-[200px]">{item.name}</span>
                      <div className="flex flex-row items-center gap-2">
                        <div className="flex flex-row items-center gap-2 bg-white rounded-lg">
                          {item.unit_details.map((detail: any, index: any) => (
                            <div 
                              key={index}
                              className={`cursor-pointer min-w-[50px] px-2 py-1 text-center rounded ${activeUnit[item.product_id] === index ? 'bg-[#D9D6FF] text-white' : 'hover:bg-gray-100'}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleUnit(item.product_id, index);
                              }}
                            >
                              <span>
                                {detail.unit_of_measurement}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="flex flex-row items-center gap-2">
                          Total:
                          {item.unit_details.map((detail: any, index: any) => (
                            activeUnit[item.product_id] === index && (
                              <div 
                                key={index}
                                className="px-2 py-1 text-black min-w-[100px] text-end"
                              >
                                <span>
                                  {detail.unit_size} {detail.unit_of_measurement}
                                </span>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    </div> : null }
                  <div className="flex flex-row items-center justify-between w-full flex-row w-full">
                    {activeMatch ? (
                      <>
                        <img 
                          src={activeMatch.image} 
                          alt={activeMatch.name} 
                          className="w-[40px] h-[40px] rounded-md cursor-pointer mr-4" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImageClick(item, activeMatch);
                          }}
                        />
                        <div className="flex flex-col w-full">
                          <span className="font-medium truncate max-w-[200px]">{activeMatch.name}</span>
                          <span className="text-sm text-gray-500">{activeMatch.unit_size} {activeMatch.unit_of_measurement}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col w-full border rounded-lg p-2 border-[#09C274]">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex flex-col">
                            <span className="font-medium opacity-60">{item.name} {item.unit_details?.map((detail, i) => (
                              <span key={i} className="text-sm">
                                {(detail.unit_size * 7).toFixed(0)}{detail.unit_of_measurement}
                                {i < item.unit_details.length - 1 && ' / '}
                              </span>
                            ))}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-xs text-[#09C274]">Match</span>
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M13.2074 3.16898C13.4327 2.94367 13.798 2.94367 14.0233 3.16898L16.331 5.47667C16.5563 5.70197 16.5563 6.06726 16.331 6.29256L14.0233 8.60025C13.798 8.82556 13.4327 8.82556 13.2074 8.60025C12.9821 8.37495 12.9821 8.00966 13.2074 7.78436L14.5303 6.46154H9.76923C8.81332 6.46154 8.03846 7.23643 8.03846 8.19231V8.96154C8.03846 9.28016 7.78016 9.53846 7.46154 9.53846C7.14291 9.53846 6.88462 9.28016 6.88462 8.96154V8.19231C6.88462 6.59919 8.17606 5.30769 9.76923 5.30769H14.5303L13.2074 3.98487C12.9821 3.75957 12.9821 3.39428 13.2074 3.16898ZM10.5385 8.38461C10.8571 8.38461 11.1154 8.64291 11.1154 8.96154V9.73077C11.1154 11.3239 9.82393 12.6154 8.23077 12.6154H3.46974L4.79256 13.9382C5.01786 14.1635 5.01786 14.5288 4.79256 14.7541C4.56726 14.9794 4.20197 14.9794 3.97667 14.7541L1.66898 12.4464C1.44367 12.2211 1.44367 11.8558 1.66898 11.6305L3.97667 9.32282C4.20197 9.09752 4.56726 9.09752 4.79256 9.32282C5.01786 9.54812 5.01786 9.91341 4.79256 10.1387L3.46974 11.4615H8.23077C9.18668 11.4615 9.96154 10.6867 9.96154 9.73077V8.96154C9.96154 8.64291 10.2198 8.38461 10.5385 8.38461Z" fill="#09C274"/>
                            </svg>
                          </div>
                        </div>
                        {/* <span className="text-sm text-gray-500">Target: {item.unit_size} {item.unit_of_measurement}</span> */}
                      </div>
                    )}
                  {activeMatch && (
                    <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (quantities[activeMatch._id] === 1) {
                            handleRemoveMatchedItem(item.product_id);
                          } else {
                            handleUpdateQuantity(activeMatch._id, -1);
                          }
                        }}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        −
                    </button>
                    <span>{quantities[activeMatch._id] || 1}</span>
                    <button
                        onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateQuantity(activeMatch._id, 1);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        +
                    </button>
                    <span>${(activeMatch.price * (quantities[activeMatch._id] || 1)).toFixed(2)}</span>
                    <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveMatchedItem(item.product_id);
                    }}
                    className="text-red-500 hover:text-red-700"
                    >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    </button>
                    </div>
                  )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showPopup && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-[800px]">
            <div className="flex justify-between items-center mb-4">
              <button 
                onClick={handlePrevItem}
                disabled={getCurrentItemIndex() === 1}
                className="text-gray-500 disabled:opacity-50"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <h3 className="text-lg font-medium">Find item match {getCurrentItemIndex()}/{shoppingList.length}</h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleNextItem}
                  disabled={getCurrentItemIndex() === shoppingList.length}
                  className="text-gray-500 disabled:opacity-50"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button onClick={() => setShowPopup(false)} className="text-gray-500">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center mb-4 bg-gray-50 p-3 rounded-lg">
              <span>{selectedItem.name} {/*selectedItem.unit_size} {selectedItem.unit_of_measurement*/}</span>
              <span className="bg-[#E9E6FF] text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                <span className="mr-2">Total weight needed: </span>
                {selectedItem.unit_details?.map((detail: any, index: any) => (
                  <span className="py-1 text-xs" key={index}>
                    {(detail.unit_size * 7).toFixed(2)} {detail.unit_of_measurement}
                    {index < selectedItem.unit_details.length - 1 && " / "}
                  </span>
                ))}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-transparent border border-gray-200 rounded-lg px-3 py-2">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12.8206 12.8206C13.0709 12.5702 13.4768 12.5702 13.7271 12.8206L17.1459 16.2394C17.3963 16.4897 17.3963 16.8956 17.1459 17.1459C16.8956 17.3963 16.4897 17.3963 16.2394 17.1459L12.8206 13.7271C12.5702 13.4768 12.5702 13.0709 12.8206 12.8206Z" fill="#9CA3AF"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M8.14562 1.94904C4.72335 1.94904 1.94904 4.72335 1.94904 8.14562C1.94904 11.5679 4.72334 14.3422 8.14562 14.3422C11.5679 14.3422 14.3422 11.5679 14.3422 8.14562C14.3422 4.72334 11.5679 1.94904 8.14562 1.94904ZM0.666992 8.14562C0.666992 4.01529 4.01529 0.666992 8.14562 0.666992C12.276 0.666992 15.6243 4.01529 15.6243 8.14562C15.6243 12.276 12.276 15.6243 8.14562 15.6243C4.01529 15.6243 0.666992 12.276 0.666992 8.14562Z" fill="#9CA3AF"/>
                </svg>

                <input 
                type="text" 
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search"
                className="w-full bg-transparent border-none outline-none text-gray-600 placeholder-gray-400"
                />
            </div>

            <div className="flex flex-col gap-2 mb-4 mt-4">
                <MatchedItem 
                    targetItem={selectedItem}
                    selectedItem={activeMatchedItems[selectedItem.product_id]}
                />
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {searchResults?.map((match: any) => (
                <div 
                  key={match._id}
                  className={`flex justify-between items-center p-2 cursor-pointer border rounded-lg ${
                    activeMatchedItems[selectedItem.product_id] === match._id ? 'bg-[#09C274]/10 border-[#09C274]' : 'border-[transparent]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <img 
                      src={match.image} 
                      alt={match.name} 
                      className="w-[60px] h-[60px] rounded-md"
                      onClick={() => setImagePopup({ visible: true, item: match })}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium truncate max-w-[200px] hover:whitespace-nowrap hover:max-w-full" title={match.name}>{match.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-500">{match.unit_size} {match.unit_of_measurement}</span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateQuantity(match._id, -1);
                        }}
                        className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{quantities[match._id] || 1}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateQuantity(match._id, 1);
                        }}
                        className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm font-medium w-20 text-right">${(match.price * (quantities[match._id] || 1)).toFixed(2)}</span>
                    <button 
                      className={`px-3 py-1 rounded-full text-sm min-w-[100px] ${
                        activeMatchedItems[selectedItem.product_id] === match._id 
                          ? 'bg-[#09C274] text-white'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                      onClick={() => handleMatchedItemClick(selectedItem.product_id, match)}
                    >
                      {activeMatchedItems[selectedItem.product_id] === match._id ? 'Matched' : 'Match'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {imagePopup.visible && imagePopup.item && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-[500px]">
            <div className="flex justify-between items-center mb-4">
              <div className="flex flex-col items-start">
                <h3 className="text-lg font-medium">
                  {imagePopup.item.matchedItem ? imagePopup.item.matchedItem.name : imagePopup.item.name}
                </h3>
                <p className="text-sm text-[#09C274]">Target Item: {imagePopup.item.name} {imagePopup.item.unit_size} {imagePopup.item.unit_of_measurement}</p>
              </div>
              <button onClick={closeImagePopup} className="text-gray-500">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <img src={imagePopup.item.matchedItem?.image || imagePopup.item.image} alt={imagePopup.item.name} className="w-full h-auto rounded-md mb-4" />
            <p className="text-sm text-gray-500">Size: {imagePopup.item.matchedItem?.unit_size || imagePopup.item.unit_size} {imagePopup.item.matchedItem?.unit_of_measurement || imagePopup.item.unit_of_measurement}</p>
            {/* <p className="text-sm text-gray-500">Description: {imagePopup.item.description || 'No description available'}</p> */}
          </div>
        </div>
      )}

      <div className="flex justify-between text-sm">
        <span>Subtotal</span>
        <span>${(calculateSubtotal() / 100).toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Delivery Fee</span>
        <span>${(deliveryFee).toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Estimated Taxes</span>
        <span>${(calculateTax(calculateSubtotal()) / 100).toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Tip</span>
        <span>${tipAmount.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Creator Fee</span>
        <span>${(calculateShipping() / 100).toFixed(2)}</span>
      </div>
      <div className="h-[1px] bg-gray-200 my-2"></div>
      <div className="flex justify-between font-medium">
        <span>Total</span>
        <span>${(calculateTotal() / 100).toFixed(2)}</span>
      </div>
      <button 
        className={`mt-4 px-4 py-3 rounded-xl w-full font-medium ${
            shoppingList.length > 0 
            ? 'bg-[#09C274] text-white hover:bg-[#07b369] transition-colors' 
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        }`}
        disabled={shoppingList.length === 0}
        onClick={() => handleCreateOrder(calculateTotal(), activeMatchedItems, quantities)}
        >
        {shoppingList.length > 0 
            ? `Confirm and place order`
            : 'Add items to cart'
        }
        </button>
        <button 
          className="mb-4 px-4 py-2 bg-[#09C274] text-white rounded-xl"
          onClick={saveShoppingList}
        >
          Save Shopping List
        </button>
    </div>
  );
};

export default ShoppingListComponent;