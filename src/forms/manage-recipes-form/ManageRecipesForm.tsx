import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  name: z.string().min(1, "Recipe name is required"),
  calories: z.number().min(0, "Calories must be a positive number"),
  carbs: z.number().min(0, "Carbs must be a positive number"),
  fat: z.number().min(0, "Fat must be a positive number"), 
  protein: z.number().min(0, "Protein must be a positive number"),
  ingredients: z.string().min(1, "Ingredients are required"),
  instructions: z.string().min(1, "Instructions are required"),
  imageUrl: z.string().optional(),
  imageFile: z.instanceof(File, { message: "Image is required" }).optional(),
});

type RecipeFormData = z.infer<typeof formSchema>;

type Props = {
  recipes?: RecipeFormData[];
  onSave: (recipeFormData: FormData) => void;
  isLoading: boolean;
};

const ManageRecipesForm = ({ recipes = [], onSave, isLoading }: Props) => {
  const [selectedRecipeIndex, setSelectedRecipeIndex] = useState<number>(-1);
  console.log(recipes, 'Recipes in manage recipes form');

  const form = useForm<RecipeFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      calories: 0,
      carbs: 0,
      fat: 0,
      protein: 0,
      ingredients: "",
      instructions: "",
      imageUrl: "",
      imageFile: undefined,
    },
  });

  useEffect(() => {
    if (selectedRecipeIndex >= 0 && recipes[selectedRecipeIndex]) {
      form.reset(recipes[selectedRecipeIndex]);
    } else {
      form.reset({
        name: "",
        calories: 0,
        carbs: 0,
        fat: 0,
        protein: 0,
        ingredients: "",
        instructions: "",
      });
    }
  }, [selectedRecipeIndex, recipes]);

  const onSubmit = (formDataJson: RecipeFormData) => {
    try {
      console.log(formDataJson);
      console.log("Running submit on save");

      const formData = new FormData();
      formData.append("name", formDataJson.name);
      formData.append("calories", formDataJson.calories.toString());
      formData.append("carbs", formDataJson.carbs.toString());
      formData.append("fat", formDataJson.fat.toString());
      formData.append("protein", formDataJson.protein.toString());
      formData.append("ingredients", formDataJson.ingredients);
      formData.append("instructions", formDataJson.instructions);
      if (formDataJson.imageFile) {
        formData.append("imageFile", formDataJson.imageFile);
      }
      if (formDataJson.imageUrl) {
        formData.append("imageUrl", formDataJson.imageUrl);
      }
      if (selectedRecipeIndex >= 0) {
        formData.append("recipeIndex", selectedRecipeIndex.toString());
      }

      onSave(formData);
      setSelectedRecipeIndex(-1);
      form.reset({
        name: "",
        calories: 0,
        carbs: 0,
        fat: 0,
        protein: 0,
        ingredients: "",
        instructions: "",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-4">
        {recipes.map((recipe, index) => (
          <Button
            key={index}
            variant="outline"
            onClick={() => setSelectedRecipeIndex(index)}
            className={selectedRecipeIndex === index ? "bg-primary text-white" : ""}
          >
            {recipe.name}
          </Button>
        ))}
        <Button 
          variant="outline"
          onClick={() => setSelectedRecipeIndex(-1)}
          className={selectedRecipeIndex === -1 ? "bg-primary text-white" : ""}
        >
          + Add New Recipe
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 bg-gray-50 p-10 rounded-lg">
          <div className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipe Name</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="calories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calories</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="bg-white" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="carbs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carbs (g)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="bg-white" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fat (g)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="bg-white" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="protein"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Protein (g)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="bg-white" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="ingredients"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ingredients</FormLabel>
                  <FormControl>
                    <textarea 
                      {...field}
                      className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-200 mb-3 focus:outline-none focus:ring-2 focus:ring-[#ff6d3f] min-h-[100px] resize-y bg-white"
                      placeholder="Enter ingredients, one per line"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instructions</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-200 mb-3 focus:outline-none focus:ring-2 focus:ring-[#ff6d3f] min-h-[100px] resize-y bg-white"
                      placeholder="Enter cooking instructions step by step"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageFile"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>Recipe Image</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="file"
                      accept="image/*"
                      className="bg-white"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        onChange(file);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : selectedRecipeIndex >= 0 ? "Update Recipe" : "Add Recipe"}
          </Button>
        </form>
      </Form>

      <div className="mt-8">
        <h2 className="text-lg font-bold">Recipe List</h2>
        <ul className="space-y-4">
          {recipes.map((recipe, index) => (
            <li key={recipe.name} className="p-4 border rounded-lg bg-white shadow-sm cursor-pointer" onClick={() => setSelectedRecipeIndex(index)}>
              <h3 className="font-semibold">{recipe.name}</h3>
              <p>Calories: {recipe.calories}</p>
              <p>Carbs: {recipe.carbs}g</p>
              <p>Fat: {recipe.fat}g</p>
              <p>Protein: {recipe.protein}g</p>
              <p>Ingredients: {recipe.ingredients}</p>
              <p>Instructions: {recipe.instructions}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ManageRecipesForm;