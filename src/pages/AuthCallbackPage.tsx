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
        await createUser({ auth0Id: user.sub, email: user.email });
        hasCreatedUser.current = true;
        console.log("creating new user await done");
        navigate(returnTo); // Use the returnTo parameter for navigation
      }
    };

    createNewUser();
  }, [createUser, navigate, user, isLoading, error, returnTo]);

  return <>Loading...</>;
};

export default AuthCallbackPage;
