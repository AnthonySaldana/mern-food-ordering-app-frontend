import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth0 } from '@auth0/auth0-react';

interface PaymentMethod {
  id: string;
  last4: string;
  brand: string;
  exp_month: number;
  exp_year: number;
}

interface PaymentMethodSectionProps {
  email: string;
  onPaymentMethodSelect: (paymentMethodId: string) => void;
  onUserCreated?: (userData: { id: string; email: string; role: string }) => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const PaymentMethodSection = ({ onPaymentMethodSelect, onUserCreated, email }: PaymentMethodSectionProps) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvc, setCvc] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const { getAccessTokenSilently } = useAuth0();

  const { data: paymentMethods = [], isLoading, refetch } = useQuery(
    'paymentMethods',
    async () => {
      const accessToken = await getAccessTokenSilently();
      const response = await fetch(`${API_BASE_URL}/api/grocery/payment-methods?user_email=${encodeURIComponent(email)}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (response.status === 401) {
        toast("You need to login first");
        return [];
      }
      return response.json();
    }
  );

  useEffect(() => {
    if (email) {
      refetch();
    }
  }, [email]);

  const handleAddPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/grocery/payment-methods`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          card_number: cardNumber,
          exp_month: parseInt(expiryMonth),
          exp_year: parseInt(expiryYear),
          cvc,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (onUserCreated) {
          onUserCreated(data.user);
        }
        refetch();
        // Reset form
        setCardNumber('');
        setExpiryMonth('');
        setExpiryYear('');
        setCvc('');
      }
    } catch (error) {
      console.error('Error adding payment method:', error);
    }
  };

  const handlePaymentMethodSelect = (paymentMethodId: string) => {
    setSelectedPaymentMethod(paymentMethodId);
    onPaymentMethodSelect(paymentMethodId);
  };

  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/grocery/payment-methods/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_method_id: paymentMethodId,
          user_email: email,
        }),
      });

      if (response.ok) {
        toast.success('Payment method deleted successfully');
        refetch(); // Refresh the list of payment methods
      } else {
        toast.error('Failed to delete payment method');
      }
    } catch (error) {
      console.error('Error deleting payment method:', error);
      toast.error('Error deleting payment method');
    }
  };

  return (
    <div className="mt-6 bg-[#F2F6FB] rounded-xl p-6">
      <h3 className="text-lg font-semibold">Payment</h3>
      {!email && <p className="text-sm text-gray-500">(email required)</p>}

      <div className="mt-4 space-y-4">
        {isLoading ? (
          <p>Loading payment methods...</p>
        ) : (
          <>
            {!paymentMethods.message && paymentMethods?.map((method: PaymentMethod) => (
              <div
                key={method.id}
                className={`p-4 border rounded-lg cursor-pointer ${
                  selectedPaymentMethod === method.id
                    ? 'border-[#09C274] bg-[#09C274]/10'
                    : 'border-gray-200'
                }`}
                onClick={() => handlePaymentMethodSelect(method.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{method.brand}</p>
                    <p className="text-sm text-gray-600">
                      •••• {method.last4} | Expires {method.exp_month}/{method.exp_year}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePaymentMethod(method.id);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-4">Add New Card</h4>
              <form onSubmit={handleAddPaymentMethod} className="space-y-4">
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4242 4242 4242 4242"
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="expiryMonth">Month</Label>
                    <Input
                      id="expiryMonth"
                      value={expiryMonth}
                      onChange={(e) => setExpiryMonth(e.target.value)}
                      placeholder="MM"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiryYear">Year</Label>
                    <Input
                      id="expiryYear"
                      value={expiryYear}
                      onChange={(e) => setExpiryYear(e.target.value)}
                      placeholder="YYYY"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvc">CVC</Label>
                    <Input
                      id="cvc"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      placeholder="123"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="bg-[#09C274]">
                  Save Card
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentMethodSection;