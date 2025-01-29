import { useState } from 'react';
import { ShoppingListItem } from '@/types';

interface ShoppingListProps {
  shoppingList: ShoppingListItem[];
  onRemoveItem: (id: string) => void;
  onUpdateQuantity: (matchId: string, change: number) => void;
  tipAmount: number;
}

const ShoppingListComponent = ({ shoppingList, onRemoveItem, onUpdateQuantity, tipAmount }: ShoppingListProps) => {
  const [activeMatchedItems, setActiveMatchedItems] = useState<{[key: string]: string}>({});

  const handleMatchedItemClick = (shoppingItemId: string, matchedItemId: string) => {
    setActiveMatchedItems(prev => ({
      ...prev,
      [shoppingItemId]: matchedItemId
    }));
  };

  const calculateSubtotal = () => {
    return shoppingList.reduce((total, item) => {
      const activeMatchId = activeMatchedItems[item.product_id];
      const activeMatch = item.matched_items?.find(match => match._id === activeMatchId);
      if (activeMatch) {
        const itemTotal = activeMatch.price * activeMatch.adjusted_quantity;
        return total + (itemTotal * 100); // need to convert to cents
      }
      return total;
    }, 0);
  };

  const calculateTax = (subtotal: number) => {
    const TAX_RATE = 0.08; // 8% tax rate - adjust as needed
    return Math.round(subtotal * TAX_RATE);
  };

  const calculateShipping = () => {
    // You can implement dynamic shipping logic here
    const BASE_SHIPPING = 2000; // $5.00 in cents
    return BASE_SHIPPING;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    const shipping = calculateShipping();
    const total = subtotal + tax + shipping + (tipAmount * 100);
    return total;
  };

  console.log(shoppingList, 'item in shopping list')

  return (
    <div className="flex flex-col gap-2">
    <div className="mb-6">
      <h3 className="font-medium mb-3">Shopping List</h3>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium">Cart ({shoppingList.length})</h3>
      </div>
      <div className="space-y-2">
        {shoppingList.map((item) => (
          <div key={item._id} className="flex flex-col gap-2 border-b border-gray-200 py-2">
            <div className="flex justify-between items-center">
              {/* Todo setup schema for macros */}
              {/* <span className="text-sm text-gray-500">{item.macros?.carbs}g carbs, {item.macros?.protein}g protein, {item.macros?.fat}g fat</span> */}
              <div className="flex flex-col">
                <span className="font-medium">{item.name}</span>
                <span className="text-sm text-gray-500">Target:{item.unit_size} {item.unit_of_measurement}</span>
              </div>
              <button
                onClick={() => onRemoveItem(item._id)}
                className="text-red-500 hover:text-red-700"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            
            <div className="pl-4 max-h-[100px] overflow-y-auto">
              {item?.matched_items?.map((match) => (
                <div 
                  key={match._id} 
                  className={`flex justify-between items-center py-1 cursor-pointer ${
                    activeMatchedItems[item.product_id] === match._id ? 'bg-[#09C274]/10 border rounded-lg p-2 border-[#09C274]' : ''
                  }`}
                  onClick={() => handleMatchedItemClick(item.product_id, match._id)}
                >
                  <div className="flex items-center gap-2">
                    {activeMatchedItems[item.product_id] === match._id && (
                      <>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateQuantity(match._id, -1);
                          }}
                        >
                          -
                        </button>
                        <span className="bg-gray-100 px-2 py-1 rounded">{match.adjusted_quantity}</span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateQuantity(match._id, 1);
                          }}
                        >
                          +
                        </button>
                      </>
                    )}
                    <div className="flex gap-2">
                      <img src={match.image} alt={match.name} className="w-10 h-10 rounded-md" />
                      <div className="flex flex-col justify-between">
                        <span className="text-sm">{match.name}</span>
                        <span className="text-sm text-gray-500">{match.unit_size} {match.unit_of_measurement}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-sm">${(match.price * match.adjusted_quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
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
    </div>
  );
};

export default ShoppingListComponent;