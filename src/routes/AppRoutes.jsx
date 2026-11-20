
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

const Onboarding1 = lazy(() => import("../pages/auth/Onboarding1"));
const Onboarding2 = lazy(() => import("../pages/auth/Onboarding2"));
const Onboarding3 = lazy(() => import("../pages/auth/Onboarding3"));
const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const PasswordChanged = lazy(() => import("../pages/auth/PasswordChanged"));

import Home from "../pages/home/Home";
import NotFound from "../pages/errors/NotFound";
const Search = lazy(() => import("../pages/home/Search"));
const Favorites = lazy(() => import("../pages/home/Favorites"));
const Settings = lazy(() => import("../pages/home/Settings"));
const EditProfile = lazy(() => import("../pages/home/EditProfile"));
const ChangePassword = lazy(() => import("../pages/home/ChangePassword"));
const ChangePhoneNumber = lazy(() => import("../pages/home/ChangePhoneNumber"));
const ChangeEmail = lazy(() => import("../pages/home/ChangeEmail"));
const Language = lazy(() => import("../pages/home/Language"));
const Help = lazy(() => import("../pages/home/Help"));
const PrivacyPolicy = lazy(() => import("../pages/home/PrivacyPolicy"));
const ContactUs = lazy(() => import("../pages/home/ContactUs"));
const AboutApp = lazy(() => import("../pages/home/AboutApp"));
const Notifications = lazy(() => import("../pages/home/Notifications"));

const Profile = lazy(() => import("../pages/profile/Profile"));
const MyProperties = lazy(() => import("../pages/owner/MyProperties"));

const AddProperty = lazy(() => import("../pages/property/AddProperty"));
const EditProperty = lazy(() => import("../pages/property/EditProperty"));
const PropertyDetails = lazy(() => import("../pages/property/PropertyDetails"));
const LocationMap = lazy(() => import("../pages/property/LocationMap"));
const OwnerViewingRequests = lazy(() => import("../pages/owner/OwnerViewingRequests"));
const MyRequests = lazy(() => import("../pages/tenant/MyRequests"));
const OWNER_ROLES = ["owner"];
const TENANT_ROLES = ["tenant"];

function AppRoutes() {
  const protectedPage = (Page, allowedRoles) => (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <Page />
    </ProtectedRoute>
  );

  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div
            style={{
              minHeight: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#666",
            }}
          >
            ...
          </div>
        }
      >
      <Routes>
        {/* الصفحة الرئيسية عامة (مفتوحة للزوار وجوجل) */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />

        {/* Onboarding */}
        <Route path="/onboarding1" element={<Onboarding1 />} />
        <Route path="/onboarding2" element={<Onboarding2 />} />
        <Route path="/onboarding3" element={<Onboarding3 />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* إعادة تعيين كلمة المرور تتم الآن عبر رابط يرسله Firebase للبريد */}
        <Route path="/verify-otp" element={<Navigate to="/forgot-password" replace />} />
        <Route path="/reset-password" element={<Navigate to="/forgot-password" replace />} />
        <Route path="/password-changed" element={<PasswordChanged />} />

        {/* Pages available to both account types */}
        {/* صفحات عامة: البحث وتفاصيل العقار */}
        <Route path="/search" element={<Search />} />
        <Route path="/property/:id" element={<PropertyDetails />} />
        <Route path="/property-details" element={<PropertyDetails />} />
        <Route path="/favorites" element={protectedPage(Favorites)} />
        <Route path="/notifications" element={protectedPage(Notifications)} />

        <Route path="/profile" element={protectedPage(Profile)} />
        <Route path="/edit-profile" element={protectedPage(EditProfile)} />
        <Route path="/settings" element={protectedPage(Settings)} />
        <Route path="/change-password" element={protectedPage(ChangePassword)} />
        <Route path="/change-phone-number" element={protectedPage(ChangePhoneNumber)} />
        <Route path="/change-email" element={protectedPage(ChangeEmail)} />
        <Route path="/language" element={protectedPage(Language)} />

        <Route path="/help" element={protectedPage(Help)} />
        <Route path="/privacy-policy" element={protectedPage(PrivacyPolicy)} />
        <Route path="/contact-us" element={protectedPage(ContactUs)} />
        <Route path="/about-app" element={protectedPage(AboutApp)} />

        {/* Owner-only pages */}
        <Route
          path="/my-properties"
          element={protectedPage(MyProperties, OWNER_ROLES)}
        />
        <Route
          path="/owner-viewing-requests"
          element={protectedPage(OwnerViewingRequests, OWNER_ROLES)}
        />
        <Route
          path="/add-property"
          element={protectedPage(AddProperty, OWNER_ROLES)}
        />
        <Route
          path="/edit-property"
          element={protectedPage(EditProperty, OWNER_ROLES)}
        />
        <Route
          path="/select-location"
          element={protectedPage(LocationMap, OWNER_ROLES)}
        />

        {/* Tenant requests — page to be implemented */}
        <Route
          path="/my-requests"
          element={protectedPage(MyRequests, TENANT_ROLES)}
        />

        {/* Unknown routes */}
        <Route path="*" element={<NotFound />} />
        
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default AppRoutes;
