import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import MenuItemInput from "./MenuItemInput";

const MealPlansSection = () => {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "mealPlans",
  });

  return (
    <div>
      <h2 className="text-lg font-medium">Meal Plans</h2>
      {fields.map((field, index) => (
        <div key={field.id} className="border p-4 rounded-lg mb-4">
          <FormField
            control={control}
            name={`mealPlans.${index}.name`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Meal Plan Name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`mealPlans.${index}.totalCalories`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Calories</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Total Calories" type="number" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            <h3 className="text-md font-medium">Menu Items</h3>
            {field.menuItems.map((menuItem, menuItemIndex) => (
              <MenuItemInput
                key={menuItem.id}
                index={menuItemIndex}
                removeMenuItem={() => remove(menuItemIndex)}
              />
            ))}
            <Button type="button" onClick={() => append({ name: "", price: 0, ingredients: "", calories: 0, macros: { protein: 0, carbs: 0, fat: 0 }, imageUrl: "", imageFile: undefined })}>
              Add Menu Item
            </Button>
          </div>
          <Button type="button" onClick={() => remove(index)}>
            Remove Meal Plan
          </Button>
        </div>
      ))}
      <Button type="button" onClick={() => append({ name: "", totalCalories: 0, menuItems: [{ name: "", price: 0, ingredients: "", calories: 0, macros: { protein: 0, carbs: 0, fat: 0 }, imageUrl: "", imageFile: undefined }] })}>
        Add Meal Plan
      </Button>
    </div>
  );
};

export default MealPlansSection;
