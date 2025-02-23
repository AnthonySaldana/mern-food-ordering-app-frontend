import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Address } from "@/types";
import { useAuth0 } from '@auth0/auth0-react';
import { toast } from "sonner";
// import { Toaster } from "@/components/ui/sonner";

interface AddressSectionProps {
  email: string;
  onAddressSelect: (address: Address) => void;
  onUserCreated?: (userData: { id: string; email: string; role: string; addresses: Address[] }) => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AddressSection = ({ onAddressSelect, onUserCreated, email }: AddressSectionProps) => {
  const [streetNum, setStreetNum] = useState('');
  const [streetName, setStreetName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [country, setCountry] = useState('');
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const { getAccessTokenSilently } = useAuth0();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);

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
    const accessToken = await getAccessTokenSilently();
    try {
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

      const response = await fetch(`${API_BASE_URL}/api/grocery/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
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
        refetch();
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
    console.log("address", address);
    setSelectedAddress(address);
    onAddressSelect(address);
  };

  const handleDeleteAddress = async (streetNum: string, streetName: string) => {
    const accessToken = await getAccessTokenSilently();
    try {
      const response = await fetch(`${API_BASE_URL}/api/grocery/addresses/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          street_num: streetNum,
          street_name: streetName,
          user_email: email,
        }),
      });

      if (response.ok) {
        toast.success('Address deleted successfully');
        refetch(); // Refresh the list of addresses
      } else {
        toast.error('Failed to delete address');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Error deleting address');
    }
  };

  const confirmDeleteAddress = (streetNum: string, streetName: string) => {
    setAddressToDelete(`${streetNum} ${streetName}`);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    console.log("attempting to delete address");
    console.log("addressToDelete", addressToDelete);
    if (addressToDelete) {
      const streetNum = addressToDelete?.split(' ')[0];
      const streetName = addressToDelete?.split(' ').slice(1).join(' ');
      handleDeleteAddress(streetNum, streetName);
      setIsModalOpen(false);
      setAddressToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Saved Addresses</h3>
        {!email && <p className="text-sm text-gray-500">(email required)</p>}
        
        {isLoading ? (
          <p>Loading addresses...</p>
        ) : addresses?.length > 0 ? (
          <div className="space-y-3">
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
                <p className="font-medium">{address.streetNum} {address.streetName}</p>
                <p className="text-sm text-gray-600">
                  {address.city}, {address.state} {address.zipcode}
                </p>
                <p className="text-sm text-gray-600">{address.country}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmDeleteAddress(address.streetNum, address.streetName);
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No saved addresses</p>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Add New Address</h3>
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
              <Label htmlFor="country">Country <small>(country code)</small></Label>
              <Input
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Country"
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full bg-[#1C2537]">
            Add Address
          </Button>
        </form>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <p className="mb-4">Are you sure you want to delete this address?</p>
            <div className="flex gap-4 justify-end">
              <Button onClick={() => handleConfirmDelete()}>Yes, delete</Button>
              <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressSection;