export type User = {
  _id: string;
  email: string;
  name: string;
  addressLine1: string;
  city: string;
  country: string;
};

export type MenuItem = {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  calories: number;
  ingredients: string;
  instructions: string;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  positiveDescriptors?: string;
  negativeDescriptors?: string;
};

export type Restaurant = {
  _id: string;
  user: string;
  restaurantName: string;
  city: string;
  country: string;
  deliveryPrice: number;
  estimatedDeliveryTime: number;
  cuisines: string[];
  menuItems: MenuItem[];
  imageUrl: string;
  lastUpdated: string;
};

export type OrderStatus =
  | "placed"
  | "paid"
  | "inProgress"
  | "outForDelivery"
  | "delivered";

export type Order = {
  _id: string;
  restaurant: Restaurant;
  user: User;
  cartItems: {
    menuItemId: string;
    name: string;
    quantity: string;
  }[];
  deliveryDetails: {
    name: string;
    addressLine1: string;
    city: string;
    email: string;
  };
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  restaurantId: string;
};

export type RestaurantSearchResponse = {
  data: Restaurant[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
};

export type SocialMediaHandle = {
  platform: string;
  handle: string;
};

export type Influencer = {
  _id: string;
  name: string;
  bio: string;
  deliveryPrice: number;
  estimatedDeliveryTime: number;
  city: string;
  country: string;
  socialMediaHandles: SocialMediaHandle[];
  mealPlans: MealPlan[];
  imageUrl: string;
  cuisines: string[];
  menuItems: MenuItem[];
};
export type MealPlan = {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  totalCalories: number;
  menuItems: MenuItem[];
  influencer: string;
  deliveryOptions: string[];
  startDayOptions: string[];
};

export type Recipe = {
  _id: string;
  name: string;
  calories: number;
  carbs: number;
  fat: number;
  protein: number;
  ingredients: string;
  instructions: string;
  imageFile: string;
};

export type Address = {
  streetNum: string;
  streetName: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  latitude: number;
  longitude: number;
};