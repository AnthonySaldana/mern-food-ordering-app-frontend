import { CircleUserRound } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { useGetMyUser } from "@/api/MyUserApi";

const UsernameMenu = () => {
  const { user, logout } = useAuth0();
  const { currentUser, isLoading: isGetLoading } = useGetMyUser();
  console.log(isGetLoading, 'Is user loading');

  const isAdmin = currentUser?.role === 'admin';
  const isCreator = currentUser?.role === 'creator';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center px-3 font-bold hover:text-[#50ad40] gap-2">
        <CircleUserRound className="text-[#50ad40]" />
        {user?.email}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {isAdmin && (
          <DropdownMenuItem>
            <Link
              to="/manage-restaurant"
              className="font-bold hover:text-[#50ad40]"
            >
              Manage Influencer
            </Link>
          </DropdownMenuItem>
        )}
        {isCreator && (
          <>
            <DropdownMenuItem>
              <Link
                to="/creator-onboarding"
                className="font-bold hover:text-[#50ad40]"
              >
                Creator Setup
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link
                to="/manage-restaurant"
                className="font-bold hover:text-[#50ad40]"
              >
                Manage Profile
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuItem>
          <Link to="/user-profile" className="font-bold hover:text-[#50ad40]">
            User Profile
          </Link>
        </DropdownMenuItem>
        <Separator />
        <DropdownMenuItem>
          <Button
            onClick={() =>
              logout({
                logoutParams: {
                  returnTo: window.location.origin
                }
              })
            }
            className="flex flex-1 font-bold bg-[#50ad40]"
          >
            Log Out
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UsernameMenu;
