import { Influencer } from "@/types";
import { Link } from "react-router-dom";
import { AspectRatio } from "./ui/aspect-ratio";
import { Card } from "./ui/card";

type Props = {
  influencer: Influencer;
};

const SearchInfluencerCard = ({ influencer }: Props) => {
  return (
    <Link
      to={`/influencer/${influencer._id}/mealplans/0`}
      className="block"
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <AspectRatio ratio={16 / 9} className="relative">
          <img
            src={influencer.imageUrl}
            className="w-full h-full object-cover"
            alt={influencer.name}
          />
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 36 36" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="absolute bottom-2 right-2"
          >
            <rect x="0.5" y="0.5" width="35" height="35" rx="17.5" stroke="#F2F1FF" fill="#F2F1FF"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M13.2381 12.7618C12.8436 12.7618 12.5239 12.442 12.5239 12.0475C12.5239 11.653 12.8436 11.3333 13.2381 11.3333H23.9524C24.3469 11.3333 24.6667 11.653 24.6667 12.0475V22.7618C24.6667 23.1563 24.3469 23.4761 23.9524 23.4761C23.5579 23.4761 23.2381 23.1563 23.2381 22.7618V13.772L12.5527 24.4574C12.2738 24.7363 11.8215 24.7363 11.5426 24.4574C11.2636 24.1784 11.2636 23.7262 11.5426 23.4472L22.228 12.7618H13.2381Z" fill="#7B61FF"/>
          </svg>
        </AspectRatio>
        
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-md">{influencer.name}</h3>
            <div className="bg-[#F2F1FF] rounded-full px-3 py-1">
              <span className="text-sm text-[#7B61FF]">@{influencer.socialMediaHandles[0]?.handle}</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {influencer.cuisines.slice(0, 2).map((cuisine, index, array) => (
              <span key={index} className="text-sm">
                {cuisine}{index < array.length - 1 ? ', ' : ''}
              </span>
            ))}
          </p>

          <div className="flex items-center justify-between">
            {/* <svg width="24" height="24" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0.5" y="0.5" width="35" height="35" rx="17.5" stroke="#F2F1FF" fill="#F2F1FF"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M13.2381 12.7618C12.8436 12.7618 12.5239 12.442 12.5239 12.0475C12.5239 11.653 12.8436 11.3333 13.2381 11.3333H23.9524C24.3469 11.3333 24.6667 11.653 24.6667 12.0475V22.7618C24.6667 23.1563 24.3469 23.4761 23.9524 23.4761C23.5579 23.4761 23.2381 23.1563 23.2381 22.7618V13.772L12.5527 24.4574C12.2738 24.7363 11.8215 24.7363 11.5426 24.4574C11.2636 24.1784 11.2636 23.7262 11.5426 23.4472L22.228 12.7618H13.2381Z" fill="#7B61FF"/>
            </svg> */}
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default SearchInfluencerCard;
