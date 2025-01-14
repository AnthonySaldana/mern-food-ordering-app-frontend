import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Address } from "@/types";
import { useAuth0 } from '@auth0/auth0-react';
// interface Address {
//   latitude: number;
//   longitude: number;
//   streetNum: string;
//   streetName: string;
//   city: string;
//   state: string;
//   zipcode: string;
//   country: string;
// }

interface AddressSectionProps {
  email: string;
  onAddressSelect: (address: Address) => void;
  onUserCreated?: (userData: { id: string; email: string; role: string; addresses: Address[] }) => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AddressSection = ({ onAddressSelect, onUserCreated, email }: AddressSectionProps) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [streetNum, setStreetNum] = useState('');
  const [streetName, setStreetName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [country, setCountry] = useState('');
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const { getAccessTokenSilently } = useAuth0();

  const { data: addresses, isLoading, refetch } = useQuery(
    ['addresses', email],
    async () => {
      const accessToken = await getAccessTokenSilently();
      const response = await fetch(`${API_BASE_URL}/api/grocery/addresses?email=${encodeURIComponent(email)}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.json();
    },
    {
      enabled: !!email
    }
  );

  useEffect(() => {
    if (email) {
      refetch();
    }
  }, [email, refetch]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // First get coordinates from address
      const geocodeResponse = await fetch(`${API_BASE_URL}/api/grocery/geocode-address`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: `${streetNum} ${streetName}, ${city}, ${state} ${zipcode}, ${country}`
        }),
      });

      const geocodeData = await geocodeResponse.json();
      const { latitude, longitude } = geocodeData;

      // Then save address with coordinates
      const response = await fetch(`${API_BASE_URL}/api/grocery/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          latitude,
          longitude,
          streetNum,
          streetName,
          city,
          state,
          zipcode,
          country
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
        setStreetNum('');
        setStreetName('');
        setCity('');
        setState('');
        setZipcode('');
        setCountry('');
      }
    } catch (error) {
      console.error('Error adding address:', error);
    }
  };

  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address);
    onAddressSelect(address);
  };

  return (
    <div className="mt-6">
      <div className="border rounded-lg">
        <div 
          className="flex justify-between items-center p-4 cursor-pointer"
          onClick={() => email && setIsExpanded(!isExpanded)}
        >
          <div>
            <h3 className="text-lg font-semibold">Address</h3>
            {!email && <p className="text-sm text-gray-500">(email required)</p>}
          </div>
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
                <p>Loading addresses...</p>
              ) : (
                <>
                  {addresses?.map((address: Address, index: number) => (
                    <div
                      key={index}
                      className={`p-4 border rounded-lg cursor-pointer ${
                        selectedAddress === address
                          ? 'border-[#09C274] bg-[#09C274]/10'
                          : 'border-gray-200'
                      }`}
                      onClick={() => handleAddressSelect(address)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{address.streetNum} {address.streetName}</p>
                          <p className="text-sm text-gray-600">
                            {address.city}, {address.state} {address.zipcode}
                          </p>
                          <p className="text-sm text-gray-600">{address.country}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {isAddingNew ? (
                    <form onSubmit={handleAddAddress} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="streetNum">Street Number</Label>
                          <Input
                            id="streetNum"
                            value={streetNum}
                            onChange={(e) => setStreetNum(e.target.value)}
                            placeholder="123"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="streetName">Street Name</Label>
                          <Input
                            id="streetName"
                            value={streetName}
                            onChange={(e) => setStreetName(e.target.value)}
                            placeholder="Main St"
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="City"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            placeholder="State"
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="zipcode">Zipcode</Label>
                          <Input
                            id="zipcode"
                            value={zipcode}
                            onChange={(e) => setZipcode(e.target.value)}
                            placeholder="12345"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="country">Country</Label>
                          <Input
                            id="country"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            placeholder="Country"
                            required
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" className="bg-[#09C274]">
                          Save Address
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
                      + Add New Address
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

export default AddressSection;