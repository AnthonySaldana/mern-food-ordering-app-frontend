/* eslint-disable */
import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
import MenuItemDetail from "@/components/MenuItemDetail";
import { Toaster } from "@/components/ui/sonner";
import { Recipe, Influencer } from "@/types";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const fetchRecipes = async (influencerId: string): Promise<Recipe[]> => {
  const response = await fetch(`${API_BASE_URL}/api/recipe/${influencerId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch recipes");
  }
  return response.json();
};

const fetchInfluencerById = async (id: string): Promise<Influencer> => {
  const response = await fetch(`${API_BASE_URL}/api/influencer/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch influencer");
  }
  return response.json();
};

const MealPlanDetailPage = () => {
  const { influencerId, planIndex } = useParams();
  console.log(influencerId, planIndex, 'influencerId and planIndex');

  const { data: recipes, isLoading: isLoadingRecipes, error: recipesError } = useQuery(
    ["fetchRecipes", influencerId],
    () => fetchRecipes(influencerId!),
    {
      enabled: !!influencerId
    }
  );

  const { data: influencer } = useQuery(
    ["fetchInfluencer", influencerId],
    () => fetchInfluencerById(influencerId as string),
    {
      enabled: !!influencerId,
    }
  );

  if (isLoadingRecipes) {
    return <div>Loading recipes...</div>;
  }

  if (recipesError) {
    return <div>Error fetching recipes</div>;
  }

  // Calculate totals
  const totals = recipes?.reduce((acc, recipe) => {
    return {
      calories: (acc.calories || 0) + (recipe.calories || 0),
      protein: (acc.protein || 0) + (recipe.protein || 0),
      carbs: (acc.carbs || 0) + (recipe.carbs || 0),
      fat: (acc.fat || 0) + (recipe.fat || 0),
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  // Add meal type order mapping
  const mealTypeOrder: { [key: string]: number } = {
    'Pre-Workout': 1,
    'Post-Workout': 2,
    'Lunch': 3,
    'Dinner option 1': 4,
    'Dinner option 2': 5,
    'Dinner option 3': 6,
    'Dinner option 4': 7,
    'Dinner option 5': 8,
    'Dinner option 6': 9,
    'Snack': 10
  };

  // Sort recipes based on meal type if influencerId matches
  const sortedRecipes = recipes?.slice().sort((a, b) => {
    if (influencerId === '674b901be214325c55e161fc') {
      const typeA = a.name.split(':')[0].trim();
      const typeB = b.name.split(':')[0].trim();
      return (mealTypeOrder[typeA] || 999) - (mealTypeOrder[typeB] || 999);
    }
    return 0;
  });

  return (
    <div className="flex flex-col gap-4 bg-white p-3 rounded-md lg:p-6 lg:max-w-10xl lg:mx-auto lg:mt-8 max-w-[900px] mx-auto">
      {/* Add Macros Summary */}
      <div>
        <h1 className="text-2xl font-bold">{influencer?.name}</h1>
        <p className="text-sm text-gray-500">{influencer?.mealPlans[Number(planIndex) || 0]?.name}</p>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
        <h2 className="text-lg font-bold mb-2">Daily Nutrition Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-gray-600">Calories</p>
            <p className="font-semibold">{totals?.calories.toFixed(0)} kcal</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Protein</p>
            <p className="font-semibold">{totals?.protein.toFixed(1)}g</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Carbs</p>
            <p className="font-semibold">{totals?.carbs.toFixed(1)}g</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Fat</p>
            <p className="font-semibold">{totals?.fat.toFixed(1)}g</p>
          </div>
        </div>
      </div>

      <div className="block px-4 lg:px-0">
        <div key={planIndex} className="mb-12">
          <p className="text-md font-bold">Here are the recipes!</p>
          <div className="grid grid-cols-1 gap-4 mb-6">
            {sortedRecipes?.map((recipe) => (
              <MenuItemDetail
                key={recipe._id}
                menuItem={recipe}
              />
            ))}
          </div>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
};

export default MealPlanDetailPage;
