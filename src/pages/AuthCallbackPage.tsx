import { useCreateMyUser } from "@/api/MyUserApi";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading, error } = useAuth0();
  const { createUser } = useCreateMyUser();

  const hasCreatedUser = useRef(false);

  // Parse the returnTo parameter from the URL
  const searchParams = new URLSearchParams(location.search);
  const returnTo = searchParams.get("returnTo") || "/";
  const isCreator = searchParams.get("isCreator") || false;
  console.log("isCreator", isCreator);
  console.log("returnTo", returnTo);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (error) {
      console.log("error");
      console.log(error);
      navigate("/");
      return;
    }

    if (!user) {
      console.log("no user");
      navigate("/");
      return;
    }

    const createNewUser = async () => {
      if (user.sub && user.email && !hasCreatedUser.current) {
        // Check if this is a creator signup
        // const state = JSON.parse(localStorage.getItem("auth0_state") || "{}");
        // const appState = state.appState || {};
        // const isCreator = appState.isCreator || false;
        
        await createUser({
          auth0Id: user.sub,
          email: user.email,
          role: returnTo === "/creator-onboarding" ? "creator" : "user"
        });
        
        hasCreatedUser.current = true;
        console.log("creating new user await done");
        
        // If it's a creator, navigate to creator onboarding
        if (isCreator) {
          navigate("/creator-onboarding");
        } else {
          navigate(returnTo);
        }
      }
    };

    createNewUser();
  }, [createUser, navigate, user, isLoading, error, returnTo, isCreator]);

  return <>Loading...</>;
};

export default AuthCallbackPage;
