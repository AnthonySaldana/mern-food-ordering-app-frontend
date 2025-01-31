import { useState } from 'react';
import { ShoppingListItem } from '@/types';

interface ShoppingListProps {
  shoppingList: ShoppingListItem[];
  onRemoveItem: (id: string) => void;
  tipAmount: number;
  handleCreateOrder: (total: number) => void;
}

const ShoppingListComponent = ({ shoppingList, onRemoveItem, tipAmount, handleCreateOrder }: ShoppingListProps) => {
  const [activeMatchedItems, setActiveMatchedItems] = useState<{[key: string]: string}>({});
  const [selectedItem, setSelectedItem] = useState<ShoppingListItem | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [quantities, setQuantities] = useState<{[key: string]: number}>({});

  const handleMatchedItemClick = (shoppingItemId: string, matchedItemId: string) => {
    setActiveMatchedItems(prev => ({
      ...prev,
      [shoppingItemId]: matchedItemId
    }));
  };

  const handleItemClick = (item: ShoppingListItem) => {
    setSelectedItem(item);
    setShowPopup(true);
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
  };

  const calculateSubtotal = () => {
    return shoppingList.reduce((total, item) => {
      const activeMatchId = activeMatchedItems[item.product_id];
      const activeMatch = item.matched_items?.find(match => match._id === activeMatchId);
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
    const tax = calculateTax(subtotal);
    const shipping = calculateShipping();
    const total = subtotal + tax + shipping + (tipAmount * 100);
    return total;
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="mb-6 bg-[#F2F6FB] rounded-lg p-4">
        {/* <h3 className="font-medium mb-3">Shopping List</h3> */}
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium">Cart ({shoppingList.length})</h3>
        </div>
        <div className="space-y-2">
          {shoppingList.map((item) => {
            const activeMatch = item.matched_items?.find(match => match._id === activeMatchedItems[item.product_id]);
            
            return (
              <div key={item._id} className="flex flex-col gap-2 border-b border-gray-200 py-2">
                <div 
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => handleItemClick(item)}
                >
                    {activeMatch ? (
                      <>
                        <img src={activeMatch.image} alt={activeMatch.name} className="w-[40px] h-[40px] rounded-md" />
                        <div className="flex flex-col">
                          <span className="font-medium">{activeMatch.name}</span>
                          <span className="text-sm text-gray-500">{activeMatch.unit_size} {activeMatch.unit_of_measurement}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-xs text-[#09C274] bg-[#09C274]/10 px-2 py-1 rounded-full">Match</span>
                        </div>
                        <span className="text-sm text-gray-500">Target: {item.unit_size} {item.unit_of_measurement}</span>
                      </div>
                    )}
                  {activeMatch && (
                    <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateQuantity(activeMatch._id, -1);
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
                    <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemoveItem(item._id);
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
            );
          })}
        </div>
      </div>

      {showPopup && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-[800px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Replace Item</h3>
              <button onClick={() => setShowPopup(false)} className="text-gray-500">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="flex justify-between items-center mb-4 bg-gray-50 p-3 rounded-lg">
              <span>{selectedItem.name} {selectedItem.unit_size} {selectedItem.unit_of_measurement}</span>
              <span className="bg-[#E9E6FF] text-gray-700 px-3 py-1 rounded-full text-sm font-medium">Total weight needed: {selectedItem.unit_size * 7} {selectedItem.unit_of_measurement}</span>
            </div>

            <div className="flex items-center gap-2 bg-transparent border border-gray-200 rounded-lg px-3 py-2">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12.8206 12.8206C13.0709 12.5702 13.4768 12.5702 13.7271 12.8206L17.1459 16.2394C17.3963 16.4897 17.3963 16.8956 17.1459 17.1459C16.8956 17.3963 16.4897 17.3963 16.2394 17.1459L12.8206 13.7271C12.5702 13.4768 12.5702 13.0709 12.8206 12.8206Z" fill="#9CA3AF"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M8.14562 1.94904C4.72335 1.94904 1.94904 4.72335 1.94904 8.14562C1.94904 11.5679 4.72334 14.3422 8.14562 14.3422C11.5679 14.3422 14.3422 11.5679 14.3422 8.14562C14.3422 4.72334 11.5679 1.94904 8.14562 1.94904ZM0.666992 8.14562C0.666992 4.01529 4.01529 0.666992 8.14562 0.666992C12.276 0.666992 15.6243 4.01529 15.6243 8.14562C15.6243 12.276 12.276 15.6243 8.14562 15.6243C4.01529 15.6243 0.666992 12.276 0.666992 8.14562Z" fill="#9CA3AF"/>
                </svg>

                <input 
                type="text" 
                value={selectedItem.name}
                disabled
                placeholder="Search"
                className="w-full bg-transparent border-none outline-none text-gray-600 placeholder-gray-400"
                />
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {selectedItem.matched_items?.map((match) => (
                <div 
                  key={match._id}
                  className={`flex justify-between items-center p-2 cursor-pointer border rounded-lg ${
                    activeMatchedItems[selectedItem.product_id] === match._id ? 'bg-[#09C274]/10 border-[#09C274]' : 'border-[transparent]'
                  }`}
                  onClick={() => handleMatchedItemClick(selectedItem.product_id, match._id)}
                >
                  <div className="flex items-center gap-4">
                    <img src={match.image} alt={match.name} className="w-[60px] h-[60px] rounded-md" />
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

      <div className="flex justify-between text-sm">
        <span>Subtotal</span>
        <span>${(calculateSubtotal() / 100).toFixed(2)}</span>
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
        onClick={() => handleCreateOrder(calculateTotal())}
        >
        {shoppingList.length > 0 
            ? `Confirm and place order`
            : 'Add items to cart'
        }
        </button>
    </div>
  );
};

export default ShoppingListComponent;