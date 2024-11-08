import {
  useGetMyRestaurantOrders,
} from "@/api/MyRestaurantApi";
import {
  useGetMyInfluencer,
  useUpdateMyInfluencer,
  useCreateMyInfluencer
} from "@/api/InfluencerApi";
import OrderItemCard from "@/components/OrderItemCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import ManageRestaurantForm from "@/forms/manage-restaurant-form/ManageRestaurantForm";
import ManageInfluencerForm from "@/forms/manage-influencer-form/ManageInfluencerForm";

const ManageRestaurantPage = () => {
  // const { createRestaurant, isLoading: isCreateLoading } =
  //   useCreateMyRestaurant();
  // const { restaurant } = useGetMyRestaurant();
  const { influencer } = useGetMyInfluencer();
  // const { updateRestaurant, isLoading: isUpdateLoading } =
  //   useUpdateMyRestaurant();
  const { createInfluencer, isLoading: isCreateInfluencerLoading } =
    useCreateMyInfluencer();
  const { updateInfluencer, isLoading: isUpdateInfluencerLoading } =
    useUpdateMyInfluencer();

  const { orders } = useGetMyRestaurantOrders();

  const isEditing = !!influencer;

  console.log(influencer, 'Influencer data');

  return (
    <Tabs defaultValue="orders">
      <TabsList>
        <TabsTrigger value="orders">Orders</TabsTrigger>
        <TabsTrigger value="manage-influencer">Manage Influencer</TabsTrigger>
      </TabsList>
      <TabsContent
        value="orders"
        className="space-y-5 bg-gray-50 p-10 rounded-lg"
      >
        <h2 className="text-2xl font-bold">{orders?.length} active orders</h2>
        {orders?.map((order) => (
          <OrderItemCard order={order} />
        ))}
      </TabsContent>
      <TabsContent value="manage-influencer">
        <ManageInfluencerForm
          influencer={influencer}
          onSave={isEditing ? updateInfluencer : createInfluencer}
          isLoading={isCreateInfluencerLoading || isUpdateInfluencerLoading}
        />
      </TabsContent>
    </Tabs>
  );
};

export default ManageRestaurantPage;
