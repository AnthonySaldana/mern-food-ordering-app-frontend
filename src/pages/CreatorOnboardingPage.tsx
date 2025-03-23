import { useGetMyUser } from "@/api/MyUserApi";
import { useCreateMyInfluencer, useGetMyInfluencer } from "@/api/InfluencerApi";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import ManageInfluencerForm from "@/forms/manage-influencer-form/ManageInfluencerForm";
import { toast } from "sonner";

const CreatorOnboardingPage = () => {
  const navigate = useNavigate();
  const { currentUser, isLoading: isUserLoading } = useGetMyUser();
  const { createInfluencer, isLoading: isCreateLoading } = useCreateMyInfluencer();
  const { influencer, isLoading: isInfluencerLoading } = useGetMyInfluencer();

  useEffect(() => {
    // If user is not a creator, redirect to home
    if (currentUser && currentUser.role !== "creator") {
      navigate("/");
    }

    // If influencer profile already exists and is complete, redirect to management page
    if (influencer && influencer.name && influencer.bio && influencer.imageUrl) {
      toast.info("Your creator profile is already set up");
      navigate("/manage-restaurant");
    }
  }, [currentUser, influencer, navigate]);

  const handleSave = async (influencerFormData: FormData) => {
    try {
      await createInfluencer(influencerFormData);
      toast.success("Creator profile created successfully!");
      navigate("/manage-restaurant");
    } catch (error) {
      toast.error("Failed to create creator profile. Please try again.");
      console.error("Error creating influencer:", error);
    }
  };

  if (isUserLoading || isInfluencerLoading) {
    return <div className="flex justify-center items-center min-h-[200px]">Loading...</div>;
  }

  return (
    <div className="max-w-screen-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Set Up Your Creator Profile</h1>
      <p className="text-gray-600 mb-8">
        Complete the form below to set up your creator profile. This information will be displayed to users browsing the platform.
      </p>
      <ManageInfluencerForm 
        influencer={influencer} 
        onSave={handleSave} 
        isLoading={isCreateLoading} 
      />
    </div>
  );
};

export default CreatorOnboardingPage;