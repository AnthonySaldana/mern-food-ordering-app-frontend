/* eslint-disable */
import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
import MenuItemDetail from "@/components/MenuItemDetail";
import { Toaster } from "@/components/ui/sonner";
import { Recipe } from "@/types";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const fetchRecipes = async (influencerId: string): Promise<Recipe[]> => {
  const response = await fetch(`${API_BASE_URL}/api/recipe/${influencerId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch recipes");
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

  if (isLoadingRecipes) {
    return <div>Loading recipes...</div>;
  }

  if (recipesError) {
    return <div>Error fetching recipes</div>;
  }

  return (
    <div className="flex flex-col gap-4 bg-white p-3 rounded-md lg:p-6 lg:max-w-10xl lg:mx-auto lg:mt-8 max-w-[900px] mx-auto">
      <div className="block px-4 lg:px-0">
        <div key={planIndex} className="mb-12">
          <p className="text-md font-bold">Here are the recipes!</p>
          <div className="grid grid-cols-1 gap-4 mb-6">
            {recipes?.map((recipe) => (
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
