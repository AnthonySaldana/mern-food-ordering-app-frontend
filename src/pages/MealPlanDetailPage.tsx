import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
import { Influencer, MenuItem } from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const fetchInfluencerById = async (id: string): Promise<Influencer> => {
  const response = await fetch(`${API_BASE_URL}/api/influencer/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch influencer");
  }
  return response.json();
};

const MealPlanDetailPage = () => {
  const { id } = useParams();
  const { data: influencer, isLoading, error } = useQuery(
    ["fetchInfluencer", id],
    () => fetchInfluencerById(id as string),
    {
      enabled: !!id,
    }
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error fetching influencer</div>;
  }

  const mealPlan = influencer?.mealPlans?.[0];

  if (!mealPlan) {
    return <div>No meal plan found</div>;
  }

  return (
    <div className="meal-plan-detail">
      <h1 className="text-4xl font-bold mb-4">{mealPlan.name}</h1>
      <p className="text-lg mb-4">{mealPlan.totalCalories} cal/week</p>
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Plan Items</h2>
        <div className="grid grid-cols-3 gap-4">
          {mealPlan.menuItems.map((item: MenuItem) => (
            <div key={item._id} className="menu-item">
              <img src={item.imageUrl} alt={item.name} className="w-full h-32 object-cover mb-2" />
              <h3 className="text-lg font-semibold">{item.name}</h3>
              <p className="text-sm">${(item.price / 100).toFixed(2)}</p>
              {item.ingredients && (
                <p className="text-sm text-gray-600">Ingredients: {item.ingredients}</p>
              )}
              {item.calories && (
                <p className="text-sm text-gray-600">Calories: {item.calories}</p>
              )}
              {item.macros && (
                <div className="text-sm text-gray-600">
                  <p>Protein: {item.macros.protein}g</p>
                  <p>Carbs: {item.macros.carbs}g</p>
                  <p>Fat: {item.macros.fat}g</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Delivery Information</h2>
        <p>Delivery Price: ${(influencer?.deliveryPrice / 100).toFixed(2)}</p>
        <p>Estimated Delivery Time: {influencer?.estimatedDeliveryTime} minutes</p>
      </div>
    </div>
  );
};

export default MealPlanDetailPage;
