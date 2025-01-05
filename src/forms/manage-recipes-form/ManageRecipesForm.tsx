import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  recipeName: z.string().min(1, "Recipe name is required"),
  ingredients: z.string().min(1, "Ingredients are required"),
  instructions: z.string().min(1, "Instructions are required"),
  imageUrl: z.string().optional(),
  imageFile: z.instanceof(File, { message: "Image is required" }).optional(),
});

type RecipeFormData = z.infer<typeof formSchema>;

type Props = {
  recipe?: RecipeFormData;
  onSave: (recipeFormData: FormData) => void;
  isLoading: boolean;
};

const ManageRecipesForm = ({ onSave, isLoading, recipe }: Props) => {
  const form = useForm<RecipeFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipeName: "",
      ingredients: "",
      instructions: "",
    },
  });

  useEffect(() => {
    if (recipe) {
      form.reset(recipe);
    }
  }, [form, recipe]);

  const onSubmit = (formDataJson: RecipeFormData) => {
    const formData = new FormData();
    formData.append("recipeName", formDataJson.recipeName);
    formData.append("ingredients", formDataJson.ingredients);
    formData.append("instructions", formDataJson.instructions);
    if (formDataJson.imageFile) {
      formData.append("imageFile", formDataJson.imageFile);
    }
    onSave(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 bg-gray-50 p-10 rounded-lg">
        <div className="space-y-8">
          <FormField
            control={form.control}
            name="recipeName"
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
          {isLoading ? "Saving..." : "Save Recipe"}
        </Button>
      </form>
    </Form>
  );
};

export default ManageRecipesForm;