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
        <CardContent className="flex items-center gap-4 p-4">
          {menuItem.imageUrl && (
            <div className="relative w-24 h-24">
              <img
                src={menuItem.imageUrl}
                alt={menuItem.name}
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-sm">
                {(menuItem.price / 100).toFixed(2)} cal
              </div>
            </div>
          )}
          
          <div className="flex-1 flex flex-col items-left">
            <h3 className="font-bold text-lg text-left">{menuItem.name}</h3>
          </div>

          <div className="text-orange-500">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0.5" y="0.5" width="35" height="35" rx="17.5" stroke="black"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M13.2381 12.7618C12.8436 12.7618 12.5239 12.442 12.5239 12.0475C12.5239 11.653 12.8436 11.3333 13.2381 11.3333H23.9524C24.3469 11.3333 24.6667 11.653 24.6667 12.0475V22.7618C24.6667 23.1563 24.3469 23.4761 23.9524 23.4761C23.5579 23.4761 23.2381 23.1563 23.2381 22.7618V13.772L12.5527 24.4574C12.2738 24.7363 11.8215 24.7363 11.5426 24.4574C11.2636 24.1784 11.2636 23.7262 11.5426 23.4472L22.228 12.7618H13.2381Z" fill="black"/>
            </svg>
          </div>
        </CardContent>
      </div>

      {isAccordionOpen && (
        <div className="p-4 border-t border-gray-200">
          <h2 className="text-xl font-bold">{menuItem.name}</h2>
          {menuItem.imageUrl && (
            <img
              src={menuItem.imageUrl}
              alt={menuItem.name}
              className="w-full h-auto object-cover rounded-lg my-4"
            />
          )}
          <p className="text-lg">Price: ${(menuItem.price / 100).toFixed(2)}</p>
          <button
            className="mt-4 bg-orange-500 text-white px-4 py-2 rounded"
            onClick={() => {
              addToCart();
              handleToggleAccordion();
            }}
          >
            Add to Cart
          </button>
        </div>
      )}
    </>
  );
};

export default MenuItem;
