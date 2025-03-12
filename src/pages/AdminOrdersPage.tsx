import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Order } from "@/types";

type OrderFilters = {
  influencerId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
};

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<OrderFilters>({});
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const { getAccessTokenSilently } = useAuth0();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const accessToken = await getAccessTokenSilently();
        const queryParams = new URLSearchParams();
        
        if (filters.influencerId) queryParams.append("influencerId", filters.influencerId);
        if (filters.status) queryParams.append("status", filters.status);
        if (filters.startDate) queryParams.append("startDate", filters.startDate);
        if (filters.endDate) queryParams.append("endDate", filters.endDate);
        
        queryParams.append("sort", `${sortField}:${sortDirection}`);

        const response = await fetch(
          `${API_BASE_URL}/api/grocery/admin/orders?${queryParams.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }

        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [filters, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Order Management</h1>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Filter by Influencer ID"
            className="border p-2 rounded"
            onChange={(e) => setFilters({ ...filters, influencerId: e.target.value })}
          />
          <select
            className="border p-2 rounded"
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            <option value="placed">Placed</option>
            <option value="paid">Paid</option>
            <option value="inProgress">In Progress</option>
            <option value="outForDelivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
          </select>
          <input
            type="date"
            className="border p-2 rounded"
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          />
          <input
            type="date"
            className="border p-2 rounded"
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("createdAt")}>
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Meal Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Delivery Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("status")}>
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("totalAmount")}>
                Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{order._id}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div>{order.deliveryDetails.user_email || "N/A"}</div>
                    <div className="text-sm text-gray-500">{order.deliveryDetails.user_name || ""}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {order.meal_plan_name || "N/A"}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    {order.deliveryDetails.street_num} {order.deliveryDetails.street_name}
                    <br />
                    {order.deliveryDetails.city}, {order.deliveryDetails.state} {order.deliveryDetails.zipcode}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    order.status === "delivered" ? "bg-green-100 text-green-800" :
                    order.status === "inProgress" ? "bg-blue-100 text-blue-800" :
                    order.status === "placed" ? "bg-yellow-100 text-yellow-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  ${order.quote?.total_without_tips ? (order.quote.total_without_tips / 100).toFixed(2) : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrdersPage;