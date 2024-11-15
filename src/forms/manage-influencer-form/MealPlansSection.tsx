import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import MenuItemInput from "./MenuItemInput";
import { Control } from "react-hook-form";

const MealPlansSection = () => {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "mealPlans",
  });

  return (
    <div>
      <h2 className="text-lg font-medium">Meal Plans</h2>
      {fields.map((field, index) => {
        return (
          <MealPlanItem
            key={field.id}
            control={control}
            index={index}
            removeMealPlan={() => remove(index)}
          />
        );
      })}
      <Button type="button" onClick={() => append({ name: "", totalCalories: 0, menuItems: [] })}>
        Add Meal Plan
      </Button>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MealPlanItem = ({ control, index, removeMealPlan }: { control: Control<any>; index: number; removeMealPlan: () => void }) => {
  const { fields: menuItems, append: appendMenuItem, remove: removeMenuItem } = useFieldArray({
    control,
    name: `mealPlans.${index}.menuItems`,
  });

  return (
    <div className="border p-4 rounded-lg mb-4">
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
        {menuItems.map((menuItem, menuItemIndex) => (
          <MenuItemInput
            key={menuItem.id}
            index={menuItemIndex}
            mealPlanIndex={index}
            removeMenuItem={() => removeMenuItem(menuItemIndex)}
          />
        ))}
        <Button type="button" onClick={() => appendMenuItem({ name: "", price: 0, ingredients: "", calories: 0, macros: { protein: 0, carbs: 0, fat: 0 }, imageUrl: "", imageFile: undefined })}>
          Add Menu Item
        </Button>
      </div>
      <Button type="button" onClick={removeMealPlan}>
        Remove Meal Plan
      </Button>
    </div>
  );
};

export default MealPlansSection;
