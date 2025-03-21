import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import DetailsSection from "./DetailsSection";
import { Separator } from "@/components/ui/separator";
import CuisinesSection from "./CuisinesSection";
import MealPlansSection from "./MealPlansSection";
import ImageSection from "./ImageSection";
import LoadingButton from "@/components/LoadingButton";
import { Button } from "@/components/ui/button";
import { Influencer } from "@/types";
import { useEffect } from "react";

const formSchema = z
  .object({
    name: z.string({
      required_error: "Influencer name is required",
    }),
    bio: z.string({
      required_error: "Bio is required",
    }),
    city: z.string({
      required_error: "City is required",
    }),
    country: z.string({
      required_error: "Country is required",
    }),
    deliveryPrice: z.coerce.number({
      required_error: "delivery price is required",
      invalid_type_error: "must be a valid number",
    }),
    estimatedDeliveryTime: z.coerce.number({
      required_error: "estimated delivery time is required",
      invalid_type_error: "must be a valid number",
    }),
    socialMediaHandles: z.array(
      z.object({
        platform: z.string().min(1, "Platform is required").optional(),
        handle: z.string().min(1, "Handle is required").optional(),
      })
    ).optional(),
    cuisines: z.array(z.string()).nonempty({
      message: "please select at least one item",
    }),
    mealPlans: z.array(
      z.object({
        name: z.string().min(1, "name is required"),
        description: z.string().min(1, "description is required"),
        totalCalories: z.coerce.number().optional(),
        totalProtein: z.coerce.number().default(0),
        totalCarbs: z.coerce.number().default(0),
        totalFat: z.coerce.number().default(0),
        imageUrl: z.string().optional(),
        imageFile: z.instanceof(File, { message: "Image is required" }).optional(),
        menuItems: z.array(
          z.object({
            name: z.string().min(1, "name is required"),
            price: z.coerce.number().min(0, "price is required"),
            ingredients: z.string().optional(),
            calories: z.coerce.number().optional(),
            macros: z.object({
              protein: z.coerce.number().optional(),
              carbs: z.coerce.number().optional(),
              fat: z.coerce.number().optional(),
            }),
            imageUrl: z.string().optional(),
            imageFile: z.instanceof(File, { message: "Image is required" }).optional(),
            positiveDescriptors: z.string().optional(),
            negativeDescriptors: z.string().optional(),
          })
        ),
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
      name: "",
      bio: "",
      city: "",
      country: "",
      deliveryPrice: 0,
      estimatedDeliveryTime: 0,
      socialMediaHandles: [{ platform: "", handle: "" }],
      cuisines: [],
      mealPlans: [{ 
        name: "", 
        description: "", 
        totalCalories: 0, 
        totalProtein: 0, 
        totalCarbs: 0,   
        totalFat: 0,     
        imageUrl: "", 
        imageFile: undefined, 
        menuItems: [{ 
          name: "", 
          price: 0, 
          ingredients: "", 
          calories: 0, 
          macros: { protein: 0, carbs: 0, fat: 0 }, 
          imageUrl: "", 
          imageFile: undefined, 
          positiveDescriptors: "", 
          negativeDescriptors: "" 
        }] 
      }],
      imageUrl: "",
      imageFile: undefined,
    },
  });

  useEffect(() => {
    if (!influencer) {
      return;
    }

    console.log(influencer, 'Influencer data in effect');

    try {
      const deliveryPriceFormatted = parseInt(
        (influencer.deliveryPrice / 100).toFixed(2)
      );

      const mealPlansFormatted = influencer.mealPlans ? influencer.mealPlans.map((plan) => ({
        ...plan,
        totalProtein: plan.totalProtein || 0,
        totalCarbs: plan.totalCarbs || 0,
        totalFat: plan.totalFat || 0,
        menuItems: plan.menuItems.map((item) => ({
          ...item,
          price: parseInt((item.price / 100).toFixed(2)),
        })),
      })) : [];

      const updatedInfluencer = {
        ...influencer,
        deliveryPrice: deliveryPriceFormatted,
        mealPlans: mealPlansFormatted,
      };

      form.reset(updatedInfluencer);
    } catch (error) {
      console.error("Error formatting influencer data:", error);
      // You might want to show an error message to the user here
    }
  }, [form, influencer]);

  const onSubmit = (formDataJson: InfluencerFormData) => {
    try {
      console.log(formDataJson);
      console.log("Running submit on save");
      const formData = new FormData();

      formData.append("name", formDataJson.name);
      formData.append("bio", formDataJson.bio);
      formData.append("city", formDataJson.city);
      formData.append("country", formDataJson.country);
      formData.append("deliveryPrice", (formDataJson.deliveryPrice * 100).toString());
      formData.append("estimatedDeliveryTime", formDataJson.estimatedDeliveryTime.toString());

      if (formDataJson.socialMediaHandles) {
        formDataJson.socialMediaHandles.forEach((handle, index) => {
          if (handle.platform) {
            formData.append(`socialMediaHandles[${index}][platform]`, handle.platform);
          }
          if (handle.handle) {
            formData.append(`socialMediaHandles[${index}][handle]`, handle.handle);
          }
        });
      }

      formDataJson.cuisines.forEach((cuisine, index) => {
        formData.append(`cuisines[${index}]`, cuisine);
      });

      formDataJson.mealPlans.forEach((plan, planIndex) => {
        formData.append(`mealPlans[${planIndex}][name]`, plan.name);
        formData.append(`mealPlans[${planIndex}][description]`, plan.description);
        if (plan.totalCalories) {
          formData.append(`mealPlans[${planIndex}][totalCalories]`, plan.totalCalories.toString());
        }
        if (plan.totalProtein) {
          formData.append(`mealPlans[${planIndex}][totalProtein]`, plan.totalProtein.toString());
        }
        if (plan.totalCarbs) {
          formData.append(`mealPlans[${planIndex}][totalCarbs]`, plan.totalCarbs.toString());
        }
        if (plan.totalFat) {
          formData.append(`mealPlans[${planIndex}][totalFat]`, plan.totalFat.toString());
        }
        plan.menuItems.forEach((item, itemIndex) => {
          formData.append(`mealPlans[${planIndex}][menuItems][${itemIndex}][name]`, item.name);
          formData.append(`mealPlans[${planIndex}][menuItems][${itemIndex}][price]`, item.price.toString());
          formData.append(`mealPlans[${planIndex}][menuItems][${itemIndex}][ingredients]`, item.ingredients || "");
          formData.append(`mealPlans[${planIndex}][menuItems][${itemIndex}][calories]`, item.calories?.toString() || "");
          formData.append(`mealPlans[${planIndex}][menuItems][${itemIndex}][macros][protein]`, item.macros?.protein?.toString() || "");
          formData.append(`mealPlans[${planIndex}][menuItems][${itemIndex}][macros][carbs]`, item.macros?.carbs?.toString() || "");
          formData.append(`mealPlans[${planIndex}][menuItems][${itemIndex}][macros][fat]`, item.macros?.fat?.toString() || "");
          formData.append(`mealPlans[${planIndex}][menuItems][${itemIndex}][imageUrl]`, item.imageUrl || "");
          formData.append(`mealPlans[${planIndex}][menuItems][${itemIndex}][imageFile]`, item.imageFile || "");
          formData.append(`mealPlans[${planIndex}][menuItems][${itemIndex}][positiveDescriptors]`, item.positiveDescriptors || "");
          formData.append(`mealPlans[${planIndex}][menuItems][${itemIndex}][negativeDescriptors]`, item.negativeDescriptors || "");
        });
      });

      formData.append("imageUrl", formDataJson.imageUrl || "");
      formData.append("imageFile", formDataJson.imageFile || "");

      onSave(formData);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.error("Form submission errors:", errors);
        })}
        className="space-y-8 bg-gray-50 p-10 rounded-lg"
      >
        {influencer?._id && (
          <a href={`/influencer/${influencer._id}`} target="_blank" rel="noopener noreferrer">View Influencer Page</a>
        )}
        <DetailsSection />
        <Separator />
        <CuisinesSection />
        <Separator />
        <MealPlansSection />
        <Separator />
        <ImageSection />
        {isLoading ? <LoadingButton /> : <Button type="submit">Submit</Button>}
      </form>
    </Form>
  );
};

export default ManageInfluencerForm;