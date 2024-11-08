import React from "react";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { MealPlan, MenuItem } from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const fetchMealPlanById = async (id: string): Promise<MealPlan> => {
  const response = await fetch(`${API_BASE_URL}/mealplans/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch meal plan");
  }
  return response.json();
};

const MealPlanDetailPage = () => {
  const { id } = useParams();
  const { data: mealPlan, isLoading, error } = useQuery(
    ["fetchMealPlan", id],
    () => fetchMealPlanById(id as string),
    {
      enabled: !!id,
    }
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error fetching meal plan</div>;
  }

  return (
    <div className="meal-plan-detail">
      <h1 className="text-4xl font-bold mb-4">{mealPlan?.name}</h1>
      <p className="text-lg mb-4">{mealPlan?.totalCalories} cal/week</p>
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Plan Items</h2>
        <div className="grid grid-cols-3 gap-4">
          {mealPlan?.menuItems.map((item: MenuItem) => (
            <div key={item._id} className="menu-item">
              <img src={item.imageUrl} alt={item.name} className="w-full h-32 object-cover mb-2" />
              <h3 className="text-lg font-semibold">{item.name}</h3>
              <p className="text-sm">${item.price.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Delivery Options</h2>
        <ul>
          {mealPlan?.deliveryOptions.map((option, index) => (
            <li key={index}>{option}</li>
          ))}
        </ul>
      </div>
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Start Day Options</h2>
        <ul>
          {mealPlan?.startDayOptions.map((day, index) => (
            <li key={index}>{day}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MealPlanDetailPage;