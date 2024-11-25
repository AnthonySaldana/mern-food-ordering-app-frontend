/* eslint-disable */
import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
// import { Influencer, MenuItem as MenuItemType } from "@/types";
import { Influencer } from "@/types";
import { Card } from "@/components/ui/card";
import MenuItem from "@/components/MenuItem";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const [selectedDeliveryDate, setSelectedDeliveryDate] = useState<string | null>(null);
  const [selectedStartDay, setSelectedStartDay] = useState<string | null>("Mon");
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [isPlanExpanded, setIsPlanExpanded] = useState(false);
  const [isOrderPage, setIsOrderPage] = useState(false);
  const navigate = useNavigate();
  const randValue = () => Math.random() - 0.5;

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

  if (isOrderPage) {
    return (
      <div className="flex flex-col gap-4 bg-white p-3 rounded-md mt-[40px]" style={{ borderRadius: '24px 24px 0 0', boxShadow: '0px 0px 10px 0px #5c5c5c' }}>
        <div className="flex justify-center">
          <div className="w-12 h-1 bg-gray-300 rounded-full"/>
        </div>
        
        <div className="px-2 md:px-32 mb-6">
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-xl font-bold">{plan.name}</h2>
            <div className="flex items-center gap-2">
              <span className="bg-[#50ad40] text-black px-3 py-1 rounded-full text-sm font-bold">
                {plan.totalCalories} cal/day
              </span>
              <span className="text-gray-600">{plan.totalCalories * 7} cal/week</span>
            </div>
          </div>
        </div>

        <div className="px-2 md:px-32">
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
                    className={`px-4 py-2 rounded-lg ${selectedStartDay === day ? "bg-[#50ad40] text-white" : "bg-transparent border border-gray-200"}`}
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

            <button 
              onClick={() => setIsOrderPage(false)}
              className="mt-4 bg-white border-2 border-[#50ad40] text-[#50ad40] px-4 py-3 rounded-xl w-full font-medium"
            >
              Back
            </button>
            <button className="mt-4 bg-[#50ad40] text-white px-4 py-3 rounded-xl w-full font-medium">
              Confirm and pay - $74.95
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 bg-white p-3 rounded-md mt-[40px]" style={{ borderRadius: '24px 24px 0 0', boxShadow: '0px 0px 10px 0px #5c5c5c' }}>
      <div className="flex justify-center">
        <div className="w-12 h-1 bg-gray-300 rounded-full"/>
      </div>
      <Card className="w-full h-[320px] relative" style={{boxShadow: 'none'}}>
        <img
          src={influencer.mealPlans[Number(planIndex)].imageUrl}
          className="rounded-xl object-cover h-full w-full"
          alt={influencer.name}
        />
        <div className="absolute bottom-[-20px] left-0 right-0 p-4 rounded-2xl bg-white max-w-[90%] mx-auto border-b-0">
          <div className="flex flex-col gap-4 rounded-md" style={{ borderRadius: '24px 24px 0 0' }}>
            <div className="flex flex-row items-center gap-4 pb-2 cursor-pointer transition-colors rounded-t-lg">
              <div className="flex flex-col gap-2 items-center" style={{width: '100%'}}>
                <h2 className="text-xl font-bold">{plan.name}</h2>
                <div className="flex items-center gap-2">
                  <span className="bg-[#50ad40] text-black px-3 py-1 rounded-full text-sm font-bold">
                    {plan.totalCalories} cal/day
                  </span>
                  <span className="text-gray-600">{plan.totalCalories * 7} cal/week</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="p-4 rounded-md px-2 md:px-32">
        <div className="flex flex-row items-center justify-between">
          <div className="flex gap-4 flex-row items-center">
            <div className="w-[75px] h-[75px] rounded-full border-2 border-white overflow-hidden">
              <img
                src={influencer.imageUrl}
                className="w-full h-full object-cover"
                alt={influencer.name}
              />
            </div>
            <div className="text-left">
              <h2 className="font-bold text-black">
                {influencer.name}
              </h2>
              {influencer.socialMediaHandles[0].platform === "instagram" && 
                <a 
                  href={`https://www.instagram.com/${influencer.socialMediaHandles[0].handle}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm text-gray-600"
                >
                  @{influencer.socialMediaHandles[0].handle}
                </a>
              }
            </div>
          </div>
          <div>
            <button 
              onClick={() => navigate(`/influencer/${influencerId}/mealplans`)}
              className="flex flex-row items-center gap-2 bg-transparent border-2 border-[#50ad40] text-[#50ad40] px-4 py-2 rounded-full font-semibold hover:bg-[#50ad40] hover:text-white transition-colors"
            >
              More Plans
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
              onClick={() => navigate(`/influencer/${influencerId}/mealplans`)}
              className="cursor-pointer" style={{transform: 'rotate(90deg)'}}>
                <path d="M18 18L6 6M6 6H18M6 6V18" stroke="#50ad40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <div className="px-2 md:px-32">
        <div className="bg-[#cdecc7] rounded-xl p-6">
          <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsBioExpanded(!isBioExpanded)}>
            <p className="text-gray-700 font-bold">About {influencer.name}</p>
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24"
              className={`transition-transform ${isBioExpanded ? 'rotate-180' : ''}`}
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
          {isBioExpanded && (
            <p className="text-gray-700 mt-4">
              {influencer.bio}
            </p>
          )}
        </div>
      </div>

      <div className="px-2 md:px-32">
        <div className="bg-[#e8efe8] rounded-xl p-6">
          <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsPlanExpanded(!isPlanExpanded)}>
            <p className="text-gray-700 font-bold">About this plan</p>
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24"
              className={`transition-transform ${isPlanExpanded ? 'rotate-180' : ''}`}
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
          {isPlanExpanded && (
            <p className="text-gray-700 mt-4">
              {influencer.bio}
            </p>
          )}
        </div>
      </div>

      <div className="px-2 md:px-32">
        <div className="bg-white rounded-xl p-6 pl-0 pr-0 overflow-x-auto">
          <div className="flex gap-4 min-w-max">
            <div className="flex flex-col w-[118px]">
              <div className="bg-[#fff0ed] rounded-lg p-4 flex flex-col">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-900">Calories</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.5 2C7.5 2 4 5.5 4 8.5C4 10.433 5.567 12 7.5 12C9.433 12 11 10.433 11 8.5C11 5.5 7.5 2 7.5 2ZM7.5 3.5C7.5 3.5 9 5.5 9 7C9 7.82843 8.32843 8.5 7.5 8.5C6.67157 8.5 6 7.82843 6 7C6 5.5 7.5 3.5 7.5 3.5Z" stroke="#ff6d3f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="mt-auto">
                  <p className="text-xs text-gray-500">Average</p>
                  <p className="font-semibold text-xs text-gray-900">{plan.totalCalories || "4,000"}kcal/day</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col w-[118px]">
              <div className="bg-[#e6eef4] rounded-lg p-4 flex flex-col">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-900">Carbs</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 3C8 3 9 4 9 5C9 6 8 7 8 7M8 7C8 7 7 6 7 5C7 4 8 3 8 3M8 7V13M4 5C4 5 5 6 5 7C5 8 4 9 4 9M4 9C4 9 3 8 3 7C3 6 4 5 4 5M4 9V13M12 5C12 5 13 6 13 7C13 8 12 9 12 9M12 9C12 9 11 8 11 7C11 6 12 5 12 5M12 9V13" stroke="#ff6d3f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="mt-auto">
                  <p className="text-xs text-gray-500">Average</p>
                  <p className="font-semibold text-xs text-gray-900">{plan?.menuItems?.reduce((total, item) => total + (item?.macros?.carbs || 0), 0) || "300"}g/day</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col w-[118px]">
              <div className="bg-[#e6f4f7] rounded-lg p-4 flex flex-col">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-900">Proteins</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 4C13 5.65685 10.3137 7 7 7C3.68629 7 1 5.65685 1 4M13 4C13 2.34315 10.3137 1 7 1C3.68629 1 1 2.34315 1 4M13 4V8C13 9.65685 10.3137 11 7 11C3.68629 11 1 9.65685 1 8V4" stroke="#ff6d3f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M13 8V12C13 13.6569 10.3137 15 7 15C3.68629 15 1 13.6569 1 12V8" stroke="#ff6d3f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="mt-auto">
                  <p className="text-xs text-gray-500">Average</p>
                  <p className="font-semibold text-xs text-gray-900">{plan?.menuItems?.reduce((total, item) => total + (item?.macros?.protein || 0), 0) || "300"}g/day</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col w-[118px]">
              <div className="bg-[#e6f4f0] rounded-lg p-4 flex flex-col">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-900">Fats</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 6C4 4.34315 5.34315 3 7 3C8.65685 3 10 4.34315 10 6C10 7.65685 8.65685 9 7 9M7 9C5.34315 9 4 10.3431 4 12C4 13.6569 5.34315 15 7 15C8.65685 15 10 13.6569 10 12C10 10.3431 8.65685 9 7 9ZM7 9V6M12 4C12 2.89543 11.1046 2 10 2C8.89543 2 8 2.89543 8 4C8 5.10457 8.89543 6 10 6C11.1046 6 12 5.10457 12 4Z" stroke="#ff6d3f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="mt-auto">
                  <p className="text-xs text-gray-500">Average</p>
                  <p className="font-semibold text-xs text-gray-900">{plan?.menuItems?.reduce((total, item) => total + (item?.macros?.fat || 0), 0) || "300"}g/day</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col w-[118px]">
              <div className="bg-[#e6e8e4] rounded-lg p-4 flex flex-col">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-900">Sugars</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 4.5L8 2L3 4.5V11.5L8 14L13 11.5V4.5Z" stroke="#ff6d3f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 4.5L8 7L13 4.5" stroke="#ff6d3f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 14V7" stroke="#ff6d3f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="mt-auto">
                  <p className="text-xs text-gray-500">Average</p>
                  <p className="font-semibold text-xs text-gray-900">- g/day</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-2 md:px-32">
        <div key={planIndex} className="mb-12">
          <p className="text-md font-bold">Possible allergens</p>
          <p className="text-sm mb-4">Eggs, Soy</p>
          <p className="text-md font-bold mb-4">Here are a few items you'll be getting in this meal plan!</p>
          <>
            <div className="grid grid-cols-3 md:grid-cols-3 xs:grid-cols-3 gap-4 mb-6">
              {plan.menuItems.sort(randValue).slice(0, 3).map((menuItem) => (
                <MenuItem
                  key={menuItem._id}
                  menuItem={menuItem}
                />
              ))}
            </div>

            <button 
              onClick={() => setIsOrderPage(true)}
              className="mt-4 bg-[#50ad40] text-white px-4 py-3 rounded-xl w-full font-medium"
            >
              Order this plan - $74.95
            </button>
          </>
        </div>
      </div>
    </div>
  );
};

export default MealPlanDetailPage;
