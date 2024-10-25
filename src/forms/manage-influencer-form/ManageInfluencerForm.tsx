import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import DetailsSection from "./DetailsSection";
import { Separator } from "@/components/ui/separator";
import CuisinesSection from "./CuisinesSection";
import ImageSection from "./ImageSection";
import LoadingButton from "@/components/LoadingButton";
import { Button } from "@/components/ui/button";
import { Influencer } from "@/types";
import { useEffect } from "react";

const formSchema = z
  .object({
    influencerName: z.string({
      required_error: "Influencer name is required",
    }),
    city: z.string({
      required_error: "City is required",
    }),
    country: z.string({
      required_error: "Country is required",
    }),
    socialMediaHandles: z.array(
      z.object({
        platform: z.string().min(1, "Platform is required"),
        handle: z.string().min(1, "Handle is required"),
      })
    ),
    imageUrl: z.string().optional(),
    imageFile: z.instanceof(File, { message: "Image is required" }).optional(),
  })
  .refine((data) => data.imageUrl || data.imageFile, {
    message: "Either image URL or image File must be provided",
    path: ["imageFile"],
  });

type InfluencerFormData = z.infer<typeof formSchema>;

type Props = {
  influencer?: Influencer;
  onSave: (influencerFormData: FormData) => void;
  isLoading: boolean;
};

const ManageInfluencerForm = ({ onSave, isLoading, influencer }: Props) => {
  const form = useForm<InfluencerFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      socialMediaHandles: [{ platform: "", handle: "" }],
    },
  });

  useEffect(() => {
    if (!influencer) {
      return;
    }

    const updatedInfluencer = {
      ...influencer,
    };

    form.reset(updatedInfluencer);
  }, [form, influencer]);

  const onSubmit = (formDataJson: InfluencerFormData) => {
    const formData = new FormData();

    formData.append("influencerName", formDataJson.influencerName);
    formData.append("city", formDataJson.city);
    formData.append("country", formDataJson.country);

    formDataJson.socialMediaHandles.forEach((handle, index) => {
      formData.append(`socialMediaHandles[${index}][platform]`, handle.platform);
      formData.append(`socialMediaHandles[${index}][handle]`, handle.handle);
    });

    if (formDataJson.imageFile) {
      formData.append(`imageFile`, formDataJson.imageFile);
    }

    onSave(formData);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 bg-gray-50 p-10 rounded-lg"
      >
        <DetailsSection />
        <Separator />
        {/* <CuisinesSection /> */}
        <Separator />
        <ImageSection />
        {isLoading ? <LoadingButton /> : <Button type="submit">Submit</Button>}
      </form>
    </Form>
  );
};

export default ManageInfluencerForm;
