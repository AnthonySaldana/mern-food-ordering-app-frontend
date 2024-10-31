/* eslint-disable */
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";

const DetailsSection = () => {
  const { control, watch, setValue } = useFormContext();
  const socialMediaHandles = watch("socialMediaHandles") || [];

  const addSocialMediaHandle = () => {
    setValue("socialMediaHandles", [...socialMediaHandles, { platform: "", handle: "" }]);
  };

  return (
    <div className="space-y-2">
      <div>
        <h2 className="text-2xl font-bold">Details</h2>
        <FormDescription>
          Enter the details about your influencer profile
        </FormDescription>
      </div>
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input {...field} className="bg-white" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="flex gap-4">
        <FormField
          control={control}
          name="city"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input {...field} className="bg-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="country"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Country</FormLabel>
              <FormControl>
                <Input {...field} className="bg-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={control}
        name="bio"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bio</FormLabel>
            <FormControl>
              <Input type="textarea" {...field} className="bg-white" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="deliveryPrice"
        render={({ field }) => (
          <FormItem className="max-w-[25%]">
            <FormLabel>Delivery price (£)</FormLabel>
            <FormControl>
              <Input {...field} className="bg-white" placeholder="1.50" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="estimatedDeliveryTime"
        render={({ field }) => (
          <FormItem className="max-w-[25%]">
            <FormLabel>Estimated Delivery Time (minutes)</FormLabel>
            <FormControl>
              <Input {...field} className="bg-white" placeholder="30" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div>
        <h3 className="text-xl font-bold mt-4">Social Media Handles</h3>
        {socialMediaHandles.map((handle: any, index: number) => (
          console.log(handle, 'handle'),
          <div key={index} className="flex gap-4 mt-2">
            <FormField
              control={control}
              name={`socialMediaHandles.${index}.platform`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Platform</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-white" placeholder="e.g. Instagram" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`socialMediaHandles.${index}.handle`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Handle</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-white" placeholder="@username" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ))}
        <Button type="button" onClick={addSocialMediaHandle} className="mt-2">
          Add Social Media Handle
        </Button>
      </div>
    </div>
  );
};

export default DetailsSection;
