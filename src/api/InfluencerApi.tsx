import { SearchState } from "@/pages/SearchPage";
import { Influencer, MealPlan } from "@/types";
import { useAuth0 } from "@auth0/auth0-react";
import { useMutation, useQuery } from "react-query";
import { toast } from "sonner";
import { Recipe } from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useGetInfluencer = (influencerId?: string) => {
  const getInfluencerByIdRequest = async (): Promise<Influencer> => {
    const response = await fetch(
      `${API_BASE_URL}/api/influencer/${influencerId}`
    );

    console.log(response, 'response from influencer api');

    if (!response.ok) {
      throw new Error("Failed to get influencer");
    }

    return response.json();
  };

  const { data: influencer, isLoading } = useQuery(
    "fetchInfluencer",
    getInfluencerByIdRequest,
    {
      enabled: !!influencerId,
    }
  );

  return { influencer, isLoading };
};

export const useSearchInfluencers = (
  searchState: SearchState,
  city?: string
) => {
  const createSearchRequest = async () => {
    const params = new URLSearchParams();
    params.set("searchQuery", searchState.searchQuery);
    params.set("page", searchState.page.toString());
    params.set("selectedCuisines", searchState.selectedCuisines.join(","));
    params.set("sortOption", searchState.sortOption);

    const response = await fetch(
      `${API_BASE_URL}/api/influencer/search/${city}?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error("Failed to get influencer");
    }

    return response.json();
  };

  const { data: results, isLoading } = useQuery(
    ["searchInfluencers", searchState],
    createSearchRequest,
    { enabled: !!city }
  );

  return {
    results,
    isLoading,
  };
};

export const useGetMyInfluencer = () => {
  const { getAccessTokenSilently } = useAuth0();

  const getMyInfluencerRequest = async (): Promise<Influencer> => {
    const accessToken = await getAccessTokenSilently();

    const response = await fetch(`${API_BASE_URL}/api/influencer`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get influencer");
    }
    return response.json();
  };

  const { data: influencer, isLoading } = useQuery(
    "fetchMyInfluencer",
    getMyInfluencerRequest
  );

  return { influencer, isLoading };
};

export const useCreateMyInfluencer = () => {
  const { getAccessTokenSilently } = useAuth0();

  const createMyInfluencerRequest = async (
    influencerFormData: FormData
  ): Promise<Influencer> => {
    const accessToken = await getAccessTokenSilently();

    const response = await fetch(`${API_BASE_URL}/api/influencer`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: influencerFormData,
    });

    if (!response.ok) {
      throw new Error("Failed to create influencer");
    }

    return response.json();
  };

  const {
    mutate: createInfluencer,
    isLoading,
    isSuccess,
    error,
  } = useMutation(createMyInfluencerRequest);

  if (isSuccess) {
    toast.success("Influencer created!");
  }

  if (error) {
    toast.error("Unable to create influencer");
  }

  return { createInfluencer, isLoading };
};

export const useUpdateMyInfluencer = () => {
  const { getAccessTokenSilently } = useAuth0();

  const updateInfluencerRequest = async (
    influencerFormData: FormData
  ): Promise<Influencer> => {
    const accessToken = await getAccessTokenSilently();

    const response = await fetch(`${API_BASE_URL}/api/influencer`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: influencerFormData,
    });

    if (!response.ok) {
      throw new Error("Failed to update influencer");
    }

    return response.json();
  };

  const {
    mutate: updateInfluencer,
    isLoading,
    error,
    isSuccess,
  } = useMutation(updateInfluencerRequest);

  if (isSuccess) {
    toast.success("Influencer Updated");
  }

  if (error) {
    toast.error("Unable to update influencer");
  }

  return { updateInfluencer, isLoading };
};

export const useGetMyInfluencerMealPlans = () => {
  const { getAccessTokenSilently } = useAuth0();

  const getMyInfluencerMealPlansRequest = async (): Promise<MealPlan[]> => {
    const accessToken = await getAccessTokenSilently();

    const response = await fetch(`${API_BASE_URL}/api/influencer/mealplans`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch meal plans");
    }

    return response.json();
  };

  const { data: mealPlans, isLoading } = useQuery(
    "fetchMyInfluencerMealPlans",
    getMyInfluencerMealPlansRequest
  );

  return { mealPlans, isLoading };
};

type UpdateMealPlanRequest = {
  mealPlanId: string;
  updatedMealPlan: Partial<MealPlan>;
};

export const useUpdateMyInfluencerMealPlan = () => {
  const { getAccessTokenSilently } = useAuth0();

  const updateMyInfluencerMealPlan = async (
    updateMealPlanRequest: UpdateMealPlanRequest
  ) => {
    const accessToken = await getAccessTokenSilently();

    const response = await fetch(
      `${API_BASE_URL}/api/influencer/mealplan/${updateMealPlanRequest.mealPlanId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateMealPlanRequest.updatedMealPlan),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update meal plan");
    }

    return response.json();
  };

  const {
    mutateAsync: updateMealPlan,
    isLoading,
    isError,
    isSuccess,
    reset,
  } = useMutation(updateMyInfluencerMealPlan);

  if (isSuccess) {
    toast.success("Meal plan updated");
  }

  if (isError) {
    toast.error("Unable to update meal plan");
    reset();
  }

  return { updateMealPlan, isLoading };
};

export const useCreateRecipe = () => {
  const createRecipeRequest = async (recipeFormData: FormData): Promise<Recipe> => {
    const response = await fetch(`${API_BASE_URL}/api/recipes`, {
      method: "POST",
      body: recipeFormData,
    });

    if (!response.ok) {
      throw new Error("Failed to create recipe");
    }

    return response.json();
  };

  const { mutate: createRecipe, isLoading } = useMutation(createRecipeRequest);

  return { createRecipe, isLoading };
};

export const useGetRecipes = () => {
  const getRecipesRequest = async (): Promise<Recipe[]> => {
    const response = await fetch(`${API_BASE_URL}/api/recipes`);

    if (!response.ok) {
      throw new Error("Failed to fetch recipes");
    }

    return response.json();
  };

  const { data: recipes, isLoading } = useQuery("fetchRecipes", getRecipesRequest);

  return { recipes, isLoading };
};