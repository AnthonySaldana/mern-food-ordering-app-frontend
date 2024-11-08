import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";

type Props = {
  index: number;
  removeMenuItem: () => void;
};

const MenuItemInput = ({ index, removeMenuItem }: Props) => {
  const { control, watch } = useFormContext();

  const existingImageUrl = watch(`menuItems.${index}.imageUrl`);

  return (
    <div className="flex flex-col gap-4 border p-4 rounded-lg">
      <FormField
        control={control}
        name={`mealPlans.${index}.menuItems.${index}.name`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1">
              Name <FormMessage />
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Grilled Chicken Salad"
                className="bg-white"
              />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`mealPlans.${index}.menuItems.${index}.price`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1">
              Price <FormMessage />
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Meal average price"
                className="bg-white"
              />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`mealPlans.${index}.menuItems.${index}.ingredients`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1">
              Ingredients (comma-separated) <FormMessage />
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Chicken breast, mixed greens, tomatoes, cucumber"
                className="bg-white"
              />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`mealPlans.${index}.menuItems.${index}.instructions`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1">
              Instructions <FormMessage />
            </FormLabel>
            <FormControl>
              <Input
                type="textarea"
                {...field}
                placeholder="1. Grill chicken breast. 2. Chop vegetables. 3. Mix ingredients in a bowl."
                className="bg-white"
              />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`mealPlans.${index}.menuItems.${index}.calories`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1">
              Calories <FormMessage />
            </FormLabel>
            <FormControl>
              <Input {...field} type="number" placeholder="300" className="bg-white" />
            </FormControl>
          </FormItem>
        )}
      />
      <div className="flex gap-4">
        <FormField
          control={control}
          name={`mealPlans.${index}.menuItems.${index}.macros.protein`}
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel className="flex items-center gap-1">
                Protein (g) <FormMessage />
              </FormLabel>
              <FormControl>
                <Input {...field} type="number" placeholder="25" className="bg-white" />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`mealPlans.${index}.menuItems.${index}.macros.carbs`}
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel className="flex items-center gap-1">
                Carbs (g) <FormMessage />
              </FormLabel>
              <FormControl>
                <Input {...field} type="number" placeholder="10" className="bg-white" />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`mealPlans.${index}.menuItems.${index}.macros.fat`}
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel className="flex items-center gap-1">
                Fat (g) <FormMessage />
              </FormLabel>
              <FormControl>
                <Input {...field} type="number" placeholder="15" className="bg-white" />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
      <div className="space-y-2">
        <FormLabel>Meal Image</FormLabel>
        <div className="flex flex-col gap-4">
          {existingImageUrl && (
            <AspectRatio ratio={16 / 9}>
              <img
                src={existingImageUrl}
                className="rounded-md object-cover h-full w-full"
              />
            </AspectRatio>
          )}
          <FormField
            control={control}
            name={`mealPlans.${index}.menuItems.${index}.imageFile`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    className="bg-white"
                    type="file"
                    accept=".jpg, .jpeg, .png"
                    onChange={(event) =>
                      field.onChange(
                        event.target.files ? event.target.files[0] : null
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
      <Button
        type="button"
        onClick={removeMenuItem}
        className="bg-red-500 max-h-fit self-end"
      >
        Remove
      </Button>
    </div>
  );
};

export default MenuItemInput;
