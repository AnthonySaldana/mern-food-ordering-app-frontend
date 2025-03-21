import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./layouts/layout";
import HomePage from "./pages/HomePage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import UserProfilePage from "./pages/UserProfilePage";
import ProtectedRoute from "./auth/ProtectedRoute";
import ManageRestaurantPage from "./pages/ManageRestaurantPage";
import SearchPage from "./pages/SearchPage";
// import DetailPage from "./pages/DetailPage";
// import OrderStatusPage from "./pages/OrderStatusPage";
import InfluencerDetailPage from "./pages/InfluencerDetailPage";
import MealPlanDetailPage from "./pages/MealPlanDetailPage";
import MealPlansPage from "./pages/MealPlansPage";
import OrderReviewPage from "./pages/OrderReviewPage";
// import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import MealPlanBreakdownPage from "./pages/MealPlanBreakdownPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import CreatorOnboardingPage from "./pages/CreatorOnboardingPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout showHero={false}>
            <HomePage />
          </Layout>
        }
      />
      <Route path="/auth-callback" element={<AuthCallbackPage />} />
      <Route
        path="/search/:city"
        element={
          <Layout showHero={false}>
            <SearchPage />
          </Layout>
        }
      />
      {/* <Route
        path="/detail/:restaurantId"
        element={
          <Layout showHero={false}>
            <DetailPage />
          </Layout>
        }
      /> */}
      <Route
        path="/influencer/:influencerId"
        element={
          <Layout showHero={false}>
            <InfluencerDetailPage />
          </Layout>
        }
      />
      <Route
        path="/influencer/:id/mealplans"
        element={
          <Layout showHero={false}>
            <MealPlansPage />
          </Layout>
        }
      />
      <Route
        path="/influencer/:influencerId/mealplans/:planIndex"
        element={
          <Layout showHero={false}>
            <MealPlanDetailPage />
          </Layout>
        }
      />
      <Route
          path="/order-review/:orderId"
          element={
            <Layout>
              <OrderReviewPage />
            </Layout>
          }
        />
        <Route
          path="/order-confirmation"
          element={
            <Layout>
              <OrderReviewPage />
            </Layout>
          }
        />
      <Route
        path="/recipe/:influencerId/mealplan/:planIndex"
        element={
          <Layout>
            <MealPlanBreakdownPage />
          </Layout>
        }
      />
      <Route element={<ProtectedRoute />}>
        {/* <Route
          path="/order-status"
          element={
            <Layout>
              <OrderStatusPage />
            </Layout>
          }
        /> */}
        <Route
          path="/user-profile"
          element={
            <Layout>
              <UserProfilePage />
            </Layout>
          }
        />
        <Route
          path="/manage-restaurant"
          element={
            <Layout>
              <ManageRestaurantPage />
            </Layout>
          }
        />
        <Route path="creator-onboarding" element={<CreatorOnboardingPage />} />
        <Route 
          path="/admin/orders" 
          element={
              <Layout>
                <AdminOrdersPage />
              </Layout>
          } 
        />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
