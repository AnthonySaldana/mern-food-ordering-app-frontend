import { useState } from "react";
import { type Recipe } from "../types";
import { CardContent } from "./ui/card";

type Props = {
  menuItem: Recipe;
  addToCart?: () => void;
  onClick?: () => void;
};

const MenuItem = ({ menuItem }: Props) => {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  const handleToggleAccordion = () => {
    setIsAccordionOpen(!isAccordionOpen);
  };

  return (
    <>
      <div className="cursor-pointer hover:bg-yellow-50" onClick={handleToggleAccordion}>
        <CardContent className="flex flex-col sm:flex-row justify-between items-start p-4">
          <div className="flex flex-col">
            <h3 className="text-lg font-medium">{menuItem.name}</h3>
            <div className="text-sm flex flex-wrap gap-4 mt-2">
              <p>Calories: {menuItem?.calories}</p>
              <p>Protein: {menuItem?.protein}g</p>
              <p>Carbs: {menuItem?.carbs}g</p>
              <p>Fat: {menuItem?.fat}g</p>
            </div>
          </div>
        </CardContent>
      </div>

      {isAccordionOpen && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex flex-col">
            <p className="font-semibold">Ingredients:</p>
            <p className="mb-2">{menuItem?.ingredients}</p>
            <p className="font-semibold">Instructions:</p>
            <p className="text-sm">{menuItem?.instructions}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default MenuItem;
