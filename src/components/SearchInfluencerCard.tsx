import { Influencer } from "@/types";
import { Link } from "react-router-dom";
import { AspectRatio } from "./ui/aspect-ratio";
import { Banknote, Clock } from "lucide-react";

type Props = {
  influencer: Influencer;
};

const SearchInfluencerCard = ({ influencer }: Props) => {
  return (
    <Link
      to={`/influencer/${influencer._id}/mealplans`}
      className="flex flex-col group bg-[#c3f47d] p-0 rounded-lg shadow-md transition-transform transform hover:scale-105"
    >
      <AspectRatio ratio={16 / 9}>
        <img
          src={influencer.imageUrl}
          className="rounded-md w-full h-full object-cover rounded-b-none"
          alt={influencer.name}
        />
      </AspectRatio>
      <div className="flex items-center justify-center mb-2 bg-opacity-70 bg-white p-2 absolute bottom-[42px] left-0 w-full">
        <p className="text-md font-bold">{influencer?.name}</p>
        <p className="text-sm text-black ml-2 justify-center flex text-center">@{influencer.socialMediaHandles[0]?.handle}</p>
      </div>
      <div className="flex flex-row justify-center items-center">
        <h3 className="h-[30px] m-4 text-sm font-bold tracking-tight mb-1 group-hover:underline text-[#468933] text-center overflow-hidden text-ellipsis whitespace-nowrap max-w-[75%]">
          {influencer.bio}
        </h3>
        <svg width="28" height="28" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.5" y="0.5" width="35" height="35" rx="17.5" stroke="#468933"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M13.2381 12.7618C12.8436 12.7618 12.5239 12.442 12.5239 12.0475C12.5239 11.653 12.8436 11.3333 13.2381 11.3333H23.9524C24.3469 11.3333 24.6667 11.653 24.6667 12.0475V22.7618C24.6667 23.1563 24.3469 23.4761 23.9524 23.4761C23.5579 23.4761 23.2381 23.1563 23.2381 22.7618V13.772L12.5527 24.4574C12.2738 24.7363 11.8215 24.7363 11.5426 24.4574C11.2636 24.1784 11.2636 23.7262 11.5426 23.4472L22.228 12.7618H13.2381Z" fill="#468933"/>
        </svg>
        
        {/* <p className="text-sm text-gray-600 mb-2">{influencer.bio}</p> */}
        {/* <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-[#50ad40]">
            <Clock className="text-[#50ad40]" />
            {influencer.estimatedDeliveryTime} mins
          </div>
          <div className="flex items-center gap-1">
            <Banknote />
            Delivery from £{(influencer.deliveryPrice / 100).toFixed(2)}
          </div>
        </div> */}
      </div>
    </Link>
  );
};

export default SearchInfluencerCard;
