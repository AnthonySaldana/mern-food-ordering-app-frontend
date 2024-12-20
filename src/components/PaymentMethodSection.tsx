import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PaymentMethod {
  id: string;
  last4: string;
  brand: string;
  exp_month: number;
  exp_year: number;
}

interface PaymentMethodSectionProps {
  email: string; // Add email prop
  onPaymentMethodSelect: (paymentMethodId: string) => void;
  onUserCreated?: (userData: { id: string; email: string; role: string }) => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const PaymentMethodSection = ({ onPaymentMethodSelect, onUserCreated, email }: PaymentMethodSectionProps) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvc, setCvc] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  // const [email, setEmail] = useState('');

  const { data: paymentMethods, isLoading, refetch } = useQuery(
    'paymentMethods',
    async () => {
      const response = await fetch(`${API_BASE_URL}/api/grocery/payment-methods?user_email=${email}`);
      return response.json();
    }
  );

  useEffect(() => {
    if (email) {
      refetch();
    }
  }, [email, refetch]);

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
        setIsAddingNew(false);
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

  return (
    <div className="mt-6">
      <div className="border rounded-lg">
        <div 
          className="flex justify-between items-center p-4 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <h3 className="text-lg font-semibold">Payment Method</h3>
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24"
            className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
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

        {isExpanded && (
          <div className="p-4 border-t">
            <div className="space-y-4">
              {isLoading ? (
                <p>Loading payment methods...</p>
              ) : (
                <>
                  {paymentMethods?.map((method: PaymentMethod) => (
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
                      </div>
                    </div>
                  ))}

                  {isAddingNew ? (
                    <form onSubmit={handleAddPaymentMethod} className="space-y-4">
                      {/* <div className="mb-4">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          required
                        />
                      </div> */}
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
                      <div className="flex gap-2">
                        <Button type="submit" className="bg-[#09C274]">
                          Save Card
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsAddingNew(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <Button
                      onClick={() => setIsAddingNew(true)}
                      variant="outline"
                      className="w-full"
                    >
                      + Add New Card
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentMethodSection;