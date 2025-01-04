/* eslint-disable */
import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
import { Influencer } from "@/types";
import MenuItemDetail from "@/components/MenuItemDetail";
import { Toaster } from "@/components/ui/sonner";

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

  const { data: influencer, isLoading: isLoadingInfluencer, error } = useQuery(
    ["fetchInfluencer", influencerId],
    () => fetchInfluencerById(influencerId as string),
    {
      enabled: !!influencerId,
    }
  );

  const plan = influencer?.mealPlans[Number(planIndex) || 0];

  if (!plan) {
    return <div>No meal plan found</div>;
  }

  if (isLoadingInfluencer) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error fetching influencer</div>;
  }

  if (!influencer?.mealPlans?.length) {
    return <div>No meal plans found</div>;
  }

  return (
    <div className="flex flex-col gap-4 bg-white p-3 rounded-md lg:p-6 lg:max-w-10xl lg:mx-auto lg:mt-8">

      <div className="bg-white rounded-xl p-4 lg:p-6 pl-0 pr-0 overflow-x-auto">
        <div className="flex gap-4 min-w-max">
          <div className="flex flex-col">
            <div className="bg-[#09C274] rounded-lg p-4 flex flex-col w-[240px] h-[150px]">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-white">Calories</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.5 2C7.5 2 4 5.5 4 8.5C4 10.433 5.567 12 7.5 12C9.433 12 11 10.433 11 8.5C11 5.5 7.5 2 7.5 2ZM7.5 3.5C7.5 3.5 9 5.5 9 7C9 7.82843 8.32843 8.5 7.5 8.5C6.67157 8.5 6 7.82843 6 7C6 5.5 7.5 3.5 7.5 3.5Z" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="mt-auto">
                <p className="text-xs text-[#7E847C]">Average</p>
                <p className="font-semibold text-xs text-white">{plan.totalCalories || "4,000"}kcal/day</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="bg-[#F2F6FB] rounded-lg p-4 flex flex-col w-[240px] h-[150px]">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-900">Carbs</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 3C8 3 9 4 9 5C9 6 8 7 8 7M8 7C8 7 7 6 7 5C7 4 8 3 8 3M8 7V13M4 5C4 5 5 6 5 7C5 8 4 9 4 9M4 9C4 9 3 8 3 7C3 6 4 5 4 5M4 9V13M12 5C12 5 13 6 13 7C13 8 12 9 12 9M12 9C12 9 11 8 11 7C11 6 12 5 12 5M12 9V13" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="mt-auto">
                <p className="text-xs text-[#7E847C]">Average</p>
                <p className="font-semibold text-xs text-gray-900">{plan?.menuItems?.reduce((total, item) => total + (item?.macros?.carbs || 0), 0) || "300"}g/day</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="bg-[#4DE54A] rounded-lg p-4 flex flex-col w-[240px] h-[150px]">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-900">Proteins</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 4C13 5.65685 10.3137 7 7 7C3.68629 7 1 5.65685 1 4M13 4C13 2.34315 10.3137 1 7 1C3.68629 1 1 2.34315 1 4M13 4V8C13 9.65685 10.3137 11 7 11C3.68629 11 1 9.65685 1 8V4" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M13 8V12C13 13.6569 10.3137 15 7 15C3.68629 15 1 13.6569 1 12V8" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="mt-auto">
                <p className="text-xs text-[#7E847C]">Average</p>
                <p className="font-semibold text-xs text-gray-900">{plan?.menuItems?.reduce((total, item) => total + (item?.macros?.protein || 0), 0) || "300"}g/day</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="bg-[#D9D6FF] rounded-lg p-4 flex flex-col w-[240px] h-[150px]">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-900">Fats</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 6C4 4.34315 5.34315 3 7 3C8.65685 3 10 4.34315 10 6C10 7.65685 8.65685 9 7 9M7 9C5.34315 9 4 10.3431 4 12C4 13.6569 5.34315 15 7 15C8.65685 15 10 13.6569 10 12C10 10.3431 8.65685 9 7 9ZM7 9V6M12 4C12 2.89543 11.1046 2 10 2C8.89543 2 8 2.89543 8 4C8 5.10457 8.89543 6 10 6C11.1046 6 12 5.10457 12 4Z" stroke="#ff6d3f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="mt-auto">
                <p className="text-xs text-[#7E847C]">Average</p>
                <p className="font-semibold text-xs text-gray-900">{plan?.menuItems?.reduce((total, item) => total + (item?.macros?.fat || 0), 0) || "300"}g/day</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="block px-4 lg:px-0">
        <div key={planIndex} className="mb-12">
          <p className="text-md font-bold">Possible allergens</p>
          <p className="text-sm mb-4">Eggs, Soy</p>
          <p className="text-md font-bold mb-4">Here are the items for this meal plan!</p>
          <>
            <div className="grid grid-cols-1 gap-4 mb-6">
              {plan.menuItems.map((menuItem) => (
                <MenuItemDetail
                  key={menuItem._id}
                  menuItem={menuItem}
                />
              ))}
            </div>
          </>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
};

export default MealPlanDetailPage;
