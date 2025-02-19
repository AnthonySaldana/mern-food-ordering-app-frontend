import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const OrderReviewPage = () => {
  const { orderId } = useParams();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }
      const data = await response.json();
      setOrderDetails(data);
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  if (isLoading) {
    return <div>Loading order details...</div>;
  }

  if (!orderDetails) {
    return <div>Order not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Review Your Order</h1>
      {orderDetails ? (
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Order Items</h2>
            {orderDetails.items.map((item: any) => (
              <div key={item._id} className="flex justify-between py-2">
                <div>
                  <span className="font-medium">{item.name}</span>
                  <span className="text-gray-600 ml-2">x{item.quantity}</span>
                </div>
                <span>${(item.price * item.quantity / 100).toFixed(1)}</span>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Delivery Details</h2>
            <div className="space-y-2">
              <p>{orderDetails.deliveryAddress.streetAddress}</p>
              <p>{orderDetails.deliveryAddress.city}, {orderDetails.deliveryAddress.country}</p>
              {orderDetails.deliveryInstructions && (
                <p>Instructions: {orderDetails.deliveryInstructions}</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${(orderDetails.subtotal / 100).toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>${(orderDetails.deliveryFee / 100).toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${(orderDetails.tax / 100).toFixed(1)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${(orderDetails.total / 100).toFixed(1)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => window.location.href = '/order-confirmation'}
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