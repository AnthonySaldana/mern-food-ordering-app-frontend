import { useGetInfluencer } from "@/api/InfluencerApi";
import MenuItem from "@/components/MenuItem";
import OrderSummary from "@/components/OrderSummary";
import InfluencerInfo from "@/components/InfluencerInfo";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card, CardFooter } from "@/components/ui/card";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { MenuItem as MenuItemType } from "../types";
import CheckoutButton from "@/components/CheckoutButton";
import { UserFormData } from "@/forms/user-profile-form/UserProfileForm";
import { useCreateCheckoutSession } from "@/api/OrderApi";

export type CartItem = {
  _id: string;
  name: string;
  price: number;
  quantity: number;
};

const InfluencerDetailPage = () => {
  const { influencerId } = useParams();
  const { influencer, isLoading } = useGetInfluencer(influencerId);
  const { createCheckoutSession, isLoading: isCheckoutLoading } =
    useCreateCheckoutSession();

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const storedCartItems = sessionStorage.getItem(`cartItems-${influencerId}`);
    return storedCartItems ? JSON.parse(storedCartItems) : [];
  });

  const addToCart = (menuItem: MenuItemType) => {
    setCartItems((prevCartItems) => {
      const existingCartItem = prevCartItems.find(
        (cartItem) => cartItem._id === menuItem._id
      );

      let updatedCartItems;

      if (existingCartItem) {
        updatedCartItems = prevCartItems.map((cartItem) =>
          cartItem._id === menuItem._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        updatedCartItems = [
          ...prevCartItems,
          {
            _id: menuItem._id,
            name: menuItem.name,
            price: menuItem.price,
            quantity: 1,
          },
        ];
      }

      sessionStorage.setItem(
        `cartItems-${influencerId}`,
        JSON.stringify(updatedCartItems)
      );

      return updatedCartItems;
    });
  };

  const removeFromCart = (cartItem: CartItem) => {
    setCartItems((prevCartItems) => {
      const updatedCartItems = prevCartItems.filter(
        (item) => cartItem._id !== item._id
      );

      sessionStorage.setItem(
        `cartItems-${influencerId}`,
        JSON.stringify(updatedCartItems)
      );

      return updatedCartItems;
    });
  };

  const onCheckout = async (userFormData: UserFormData) => {
    if (!influencer) {
      return;
    }

    const checkoutData = {
      cartItems: cartItems.map((cartItem) => ({
        menuItemId: cartItem._id,
        name: cartItem.name,
        quantity: cartItem.quantity.toString(),
      })),
      influencerId: influencer._id,
      deliveryDetails: {
        name: userFormData.name,
        addressLine1: userFormData.addressLine1,
        city: userFormData.city,
        country: userFormData.country,
        email: userFormData.email as string,
      },
    };

    const data = await createCheckoutSession(checkoutData);
    window.location.href = data.url;
  };

  if (isLoading || !influencer) {
    return "Loading...";
  }

  return (
    <div className="flex flex-col gap-5">
      <Card className="w-full h-[200px] relative">
        <div className="absolute top-0 left-0 right-0 p-4">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <h2 className="bg-white/70 text-black px-5 py-1 rounded-md text-md font-bold">
                {influencer.name}
              </h2>
              {influencer?.socialMediaHandles?.map((handle, index) => (
                <span key={index} className="bg-pink-500/80 text-white px-3 py-1 rounded-full text-sm">
                  @{handle.handle}
                </span>
              ))}
            </div>
          </div>
        </div>
        <img
          src={influencer.imageUrl}
          className="rounded-md object-cover h-full w-full"
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 rounded-md bg-gradient-to-t from-black/60 to-transparent">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              {influencer.cuisines.map((cuisine, index) => (
                <span key={index} className="bg-pink-500/80 text-white px-3 py-1 rounded-full text-sm">
                  {cuisine}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>
      <div className="grid md:grid-cols-[4fr_2fr] gap-5 md:px-32">
        <div className="flex flex-col gap-4">
          {/* <InfluencerInfo influencer={influencer} /> */}
          {/* <span className="text-2xl font-bold tracking-tight">Meal Plans</span> */}
          {influencer.menuItems.map((menuItem) => (
            <MenuItem
              menuItem={menuItem}
              addToCart={() => addToCart(menuItem)}
            />
          ))}
        </div>

        <div>
          <Card>
            <OrderSummary
              influencer={influencer}
              cartItems={cartItems}
              removeFromCart={removeFromCart}
            />
            <CardFooter>
              <CheckoutButton
                disabled={cartItems.length === 0}
                onCheckout={onCheckout}
                isLoading={isCheckoutLoading}
              />
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InfluencerDetailPage;
