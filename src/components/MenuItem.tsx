import { useState } from "react";
import { type MenuItem } from "../types";
import { CardContent } from "./ui/card";

type Props = {
  menuItem: MenuItem;
  addToCart: () => void;
};

const MenuItem = ({ menuItem, addToCart }: Props) => {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  const handleToggleAccordion = () => {
    setIsAccordionOpen(!isAccordionOpen);
  };

  return (
    <>
      <div className="cursor-pointer hover:bg-yellow-50" onClick={handleToggleAccordion}>
        <CardContent className="flex flex-col items-center p-4">
          {menuItem.imageUrl && (
            <div className="relative w-24 h-24 mb-2">
              <img
                src={menuItem.imageUrl}
                alt={menuItem.name}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          )}
          <h3 className="font-bold text-lg text-center">{menuItem.name}</h3>
          <p className="text-md text-center mt-1">${(menuItem.price / 100).toFixed(2)}</p>
        </CardContent>
      </div>

      {isAccordionOpen && (
        <div className="p-4 border-t border-gray-200">
          {menuItem.imageUrl && (
            <img
              src={menuItem.imageUrl}
              alt={menuItem.name}
              className="w-full h-auto object-cover rounded-lg my-4"
            />
          )}
          <div className="text-sm flex flex-row md:flex-row md:gap-4">
            <p>Calories: {menuItem?.calories}</p>
            <p>Protein: {menuItem?.macros?.protein}g</p>
            <p>Carbs: {menuItem?.macros?.carbs}g</p>
            <p>Fat: {menuItem?.macros?.fat}g</p>
          </div>
          <div className="flex flex-col mt-4">
            <p className="font-semibold">Ingredients:</p>
            <p className="mb-2">{menuItem?.ingredients}</p>
            <p className="font-semibold">Instructions:</p>
            <p className="text-sm">{menuItem?.instructions}</p>
          </div>
          <button
            className="mt-4 bg-orange-500 text-white px-4 py-2 rounded"
            onClick={() => {
              addToCart();
              handleToggleAccordion();
            }}
          >
            ${(menuItem.price / 100).toFixed(2)} - Add to Cart
          </button>
        </div>
      )}
    </>
  );
};

export default MenuItem;
