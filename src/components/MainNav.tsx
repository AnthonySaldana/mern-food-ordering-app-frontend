import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "./ui/button";
import UsernameMenu from "./UsernameMenu";
import { Link } from "react-router-dom";

const MainNav = () => {
  const { loginWithRedirect, isAuthenticated } = useAuth0();

  const handleCreatorSignup = async () => {
    await loginWithRedirect({
      appState: {
        returnTo: "/creator-onboarding",
        isCreator: true,
      },
      authorizationParams: {
        screen_hint: "signup",
      },
    });
  };

  return (
    <span className="flex space-x-2 items-center">
      {isAuthenticated ? (
        <>
          <Link to="/order-status" className="font-bold hover:text-[#50ad40]">
            Order Status
          </Link>
          <UsernameMenu />
        </>
      ) : (
        <>
          <Button
            variant="ghost"
            className="font-bold hover:text-[#50ad40] hover:bg-white"
            onClick={async () => await loginWithRedirect({
              appState: {
                returnTo: window.location.pathname,
              },
            })}
          >
            Log In
          </Button>
          <Button
            variant="outline"
            className="font-bold text-[#50ad40] border-[#50ad40] hover:bg-[#50ad40] hover:text-white"
            onClick={handleCreatorSignup}
          >
            Become a Creator
          </Button>
        </>
      )}
    </span>
  );
};

export default MainNav;
