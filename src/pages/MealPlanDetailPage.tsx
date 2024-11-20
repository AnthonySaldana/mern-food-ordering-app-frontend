/* eslint-disable */
import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
import { Influencer, MenuItem as MenuItemType } from "@/types";
import { Card } from "@/components/ui/card";
import MenuItem from "@/components/MenuItem";
import { useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const fetchInfluencerById = async (id: string): Promise<Influencer> => {
  const response = await fetch(`${API_BASE_URL}/api/influencer/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch influencer");
  }
  return response.json();
};

const MealPlanDetailPage = () => {
  const { influencerId, planIndex } = useParams();
  // const [expandedPlanIndex, setExpandedPlanIndex] = useState<number | null>(0);
  const [selectedDeliveryDate, setSelectedDeliveryDate] = useState<string | null>(null);
  const [selectedStartDay, setSelectedStartDay] = useState<string | null>("Mon");

  const { data: influencer, isLoading, error } = useQuery(
    ["fetchInfluencer", influencerId],
    () => fetchInfluencerById(influencerId as string),
    {
      enabled: !!influencerId,
    }
  );

  const plan = influencer?.mealPlans[Number(planIndex) || 0];
  console.log(" --------- ");
  console.log(plan);
  console.log(planIndex);
  console.log(influencer);

  if (!plan) {
    return <div>No meal plan found</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error fetching influencer</div>;
  }

  if (!influencer?.mealPlans?.length) {
    return <div>No meal plans found</div>;
  }

  const addToCart = (menuItem: MenuItemType) => {
    // TODO: Implement cart functionality
    console.log("Add to cart:", menuItem);
  };

  // const togglePlan = (index: number) => {
  //   setExpandedPlanIndex(expandedPlanIndex === index ? null : index);
  // };

  return (
    <div className="flex flex-col gap-4 bg-white p-3 rounded-md mt-[40px]" style={{ borderRadius: '24px 24px 0 0' }}>
      {/* <div 
        className="border-b pb-4 mb-6 cursor-pointer hover:bg-gray-50 transition-colors p-4 rounded-t-lg"
        // onClick={() => togglePlan(planIndex)}
      >
        <h2 className="text-2xl font-bold flex items-center justify-between">
          {plan.name}
          <span className="text-lg">
            {true ? <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0.5" y="0.5" width="35" height="35" rx="17.5" stroke="black"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M13.2381 12.7618C12.8436 12.7618 12.5239 12.442 12.5239 12.0475C12.5239 11.653 12.8436 11.3333 13.2381 11.3333H23.9524C24.3469 11.3333 24.6667 11.653 24.6667 12.0475V22.7618C24.6667 23.1563 24.3469 23.4761 23.9524 23.4761C23.5579 23.4761 23.2381 23.1563 23.2381 22.7618V13.772L12.5527 24.4574C12.2738 24.7363 11.8215 24.7363 11.5426 24.4574C11.2636 24.1784 11.2636 23.7262 11.5426 23.4472L22.228 12.7618H13.2381Z" fill="black"/>
            </svg> : <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0.5" y="0.5" width="35" height="35" rx="17.5" stroke="black"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M13.2381 12.7618C12.8436 12.7618 12.5239 12.442 12.5239 12.0475C12.5239 11.653 12.8436 11.3333 13.2381 11.3333H23.9524C24.3469 11.3333 24.6667 11.653 24.6667 12.0475V22.7618C24.6667 23.1563 24.3469 23.4761 23.9524 23.4761C23.5579 23.4761 23.2381 23.1563 23.2381 22.7618V13.772L12.5527 24.4574C12.2738 24.7363 11.8215 24.7363 11.5426 24.4574C11.2636 24.1784 11.2636 23.7262 11.5426 23.4472L22.228 12.7618H13.2381Z" fill="black"/>
            </svg>}
          </span>
        </h2>
        <p className="text-gray-600 mt-2">
          {plan.totalCalories} calories per week • {plan.menuItems.length} items
        </p>
      </div> */}
      <div className="flex flex-col gap-4 p-3 rounded-md" style={{ borderRadius: '24px 24px 0 0' }}>
        <div className="flex flex-col gap-4 items-center justify-between pb-2 cursor-pointer transition-colors p-4 rounded-t-lg">
          <h2 className="text-2xl font-bold">{plan.name}</h2>
          <div className="flex items-center gap-2">
            <span className="bg-orange-500 text-black px-3 py-1 rounded-full text-sm font-bold">
              {plan.totalCalories} cal/day
            </span>
            <span className="text-gray-600">{plan.totalCalories * 7} cal/week</span>
          </div>
        </div>
      </div>
      <Card className="w-full h-[320px] relative">
        <div className="absolute top-0 left-0 right-0 p-4">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <h2 className="bg-white/70 text-black px-5 py-1 rounded-md text-md font-bold">
                {influencer.name}
                <br/>
                { influencer.socialMediaHandles[0].platform === "instagram" && <a href={`https://www.instagram.com/${influencer.socialMediaHandles[0].handle}`} target="_blank" rel="noopener noreferrer" className="text-sm font-normal">
                  @{ influencer.socialMediaHandles[0].handle }
                </a>}
              </h2>
            </div>
          </div>
        </div>
        <img
          src={influencer.imageUrl}
          className="rounded-xl object-cover h-full w-full"
          alt={influencer.name}
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 rounded-md bg-gradient-to-t from-black/60 to-transparent">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <span className="bg-pink-500/80 text-white px-3 py-1 rounded-full text-sm">
                ${(influencer.deliveryPrice ? influencer.deliveryPrice / 100 : 0).toFixed(2)} delivery
              </span>
              <span className="bg-pink-500/80 text-white px-3 py-1 rounded-full text-sm">
                {influencer.estimatedDeliveryTime} min
              </span>
            </div>
          </div>
        </div>
      </Card>

      <div className="px-2 md:px-32">
        <div key={planIndex} className="mb-12">
          <p className="text-2xl font-bold mb-4">Plan Items</p>
          <>
            <div className="grid grid-cols-3 md:grid-cols-3 xs:grid-cols-3 gap-4 mb-6">
              {plan.menuItems.map((menuItem) => (
                <MenuItem
                  key={menuItem._id}
                  menuItem={menuItem}
                  addToCart={() => addToCart(menuItem)}
                />
              ))}
            </div>

            {/* <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3">Plan Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Total Weekly Calories</p>
                  <p className="font-medium">{plan.totalCalories} calories</p>
                </div>
                <div>
                  <p className="text-gray-600">Number of Meals</p>
                  <p className="font-medium">{plan.menuItems.length} meals</p>
                </div>
              </div>
            </div> */}

            <div className="space-y-4">
              <div className="bg-[#fbfbf6] rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3">Delivery</h3>
                <p className="text-gray-600 mb-4">Choose delivery date</p>
                <div className="flex flex-col divide-y">
                  <label className="flex items-center justify-between py-4">
                    <div>
                      <span className="font-medium">Tomorrow</span>
                      <span className="text-gray-500 ml-2">Sat, 11 October</span>
                    </div>
                    <input 
                      type="radio" 
                      name="deliveryDate"
                      value="Tomorrow, Sat, 11 October"
                      checked={selectedDeliveryDate === "Tomorrow, Sat, 11 October"}
                      onChange={(e) => setSelectedDeliveryDate(e.target.value)}
                      className="h-5 w-5 text-[#ff6d3f]"
                    />
                  </label>
                  <label className="flex items-center justify-between py-4">
                    <div>
                      <span className="font-medium">In 3 days</span>
                      <span className="text-gray-500 ml-2">Mon, 14 October</span>
                    </div>
                    <input 
                      type="radio" 
                      name="deliveryDate"
                      value="In 3 days, Mon, 14 October"
                      checked={selectedDeliveryDate === "In 3 days, Mon, 14 October"}
                      onChange={(e) => setSelectedDeliveryDate(e.target.value)}
                      className="h-5 w-5 text-[#ff6d3f]"
                    />
                  </label>
                  <label className="flex items-center justify-between py-4">
                    <div>
                      <span className="font-medium">In 4 days</span>
                      <span className="text-gray-500 ml-2">Tue, 15 October</span>
                    </div>
                    <input 
                      type="radio" 
                      name="deliveryDate"
                      value="In 4 days, Tue, 15 October" 
                      checked={selectedDeliveryDate === "In 4 days, Tue, 15 October"}
                      onChange={(e) => setSelectedDeliveryDate(e.target.value)}
                      className="h-5 w-5 text-[#ff6d3f]"
                    />
                  </label>
                </div>
              </div>

              <div className="bg-[#fbfbf6] rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3">Plan start</h3>
                <p className="text-gray-600 mb-2">Which day of the week will you start your plan?</p>
                <div className="flex flex-wrap gap-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <button
                      key={day}
                      className={`px-4 py-2 rounded-lg ${selectedStartDay === day ? "bg-[#ff6d3f] text-white" : "bg-transparent border border-gray-200"}`}
                      onClick={() => setSelectedStartDay(day)}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#fbfbf6] rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3">Payment</h3>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center">
                    <input type="radio" name="paymentMethod" className="mr-2" />
                    ApplePay <span className="text-sm text-gray-500 ml-2">Default</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="paymentMethod" className="mr-2" />
                    Visa ending in 2828
                  </label>
                </div>
              </div>

              <button className="mt-4 bg-[#ff6d3f] text-white px-4 py-3 rounded-xl w-full font-medium">
                Confirm and pay - $74.95
              </button>
            </div>
          </>
        </div>
      </div>
    </div>
  );
};

export default MealPlanDetailPage;
