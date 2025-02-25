import { useState } from "react";
import { type Recipe } from "../types";
import { CardContent } from "./ui/card";

type Props = {
  menuItem: Recipe;
  addToCart?: () => void;
  onClick?: () => void;
};

const ArrowIcon = ({ isOpen }: { isOpen: boolean }) => (
  <svg 
    width="12" 
    height="12" 
    viewBox="0 0 12 12" 
    className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
  >
    <path 
      d="M2 1 L8 6 L2 11" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const MenuItem = ({ menuItem }: Props) => {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  const handleToggleAccordion = () => {
    setIsAccordionOpen(!isAccordionOpen);
  };

  return (
    <>
      <div className="cursor-pointer hover:bg-yellow-50" onClick={handleToggleAccordion}>
        <CardContent className="flex flex-col sm:flex-row justify-between items-start p-4 pr-12 relative">
          <div className="flex flex-col">
            <h3 className="text-lg font-medium">{menuItem.name}</h3>
            <div className="text-sm flex flex-wrap gap-4 mt-2">
              <p>Calories: {menuItem?.calories}</p>
              <p>Protein: {menuItem?.protein}g</p>
              <p>Carbs: {menuItem?.carbs}g</p>
              <p>Fat: {menuItem?.fat}g</p>
            </div>
          </div>
          {menuItem.imageFile && menuItem.imageFile !== 'path_to_image' && (
            <img 
              src={menuItem.imageFile}
              alt={menuItem.name}
              className="w-24 h-24 object-cover rounded-lg ml-4"
            />
          )}
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <ArrowIcon isOpen={isAccordionOpen} />
          </div>
        </CardContent>
      </div>

      {isAccordionOpen && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex flex-col">
            <p className="font-semibold">Ingredients:</p>
            <p className="mb-2">{menuItem?.ingredients}</p>
            {menuItem?.instructions && (
              <>
                <p className="font-semibold">Instructions:</p>
                <p className="text-sm">{menuItem.instructions}</p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MenuItem;
