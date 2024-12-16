import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface OrderReviewProps {
  shoppingList: any[];
  storeId: string;
  deliveryDetails: any;
}

const OrderReviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderQuote, setOrderQuote] = useState<any>(null);
  const { shoppingList, storeId, deliveryDetails } = location.state as OrderReviewProps;

  const createOrderQuote = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/grocery/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          store_id: storeId,
          items: shoppingList.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            product_marked_price: item.product_marked_price,
            selected_options: item.selected_options
          })),
          delivery_details: deliveryDetails,
          place_order: false,
          final_quote: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create order quote');
      }

      const data = await response.json();
      setOrderQuote(data);
    } catch (error) {
      console.error('Error creating order quote:', error);
    }
  };

  useEffect(() => {
    createOrderQuote();
  }, []);

  const handlePlaceOrder = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/grocery/finalize-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: orderQuote.order_id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to finalize order');
      }

      // Navigate to order confirmation page
      navigate('/order-confirmation', { 
        state: { orderId: orderQuote.order_id } 
      });
    } catch (error) {
      console.error('Error finalizing order:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Review Your Order</h1>
      
      {orderQuote ? (
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Order Items</h2>
            {shoppingList.map((item) => (
              <div key={item.product_id} className="flex justify-between py-2">
                <div>
                  <span className="font-medium">{item.name}</span>
                  <span className="text-gray-600 ml-2">x{item.quantity}</span>
                </div>
                <span>${(item.product_marked_price * item.quantity / 100).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Delivery Details</h2>
            <div className="space-y-2">
              <p>{deliveryDetails.address}</p>
              <p>{deliveryDetails.instructions}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${(orderQuote.subtotal / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>${(orderQuote.delivery_fee / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${(orderQuote.tax / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${(orderQuote.total / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            className="w-full bg-[#09C274] text-white py-3 rounded-xl font-medium"
          >
            Place Order
          </button>
        </div>
      ) : (
        <div>Loading order details...</div>
      )}
    </div>
  );
};

export default OrderReviewPage;