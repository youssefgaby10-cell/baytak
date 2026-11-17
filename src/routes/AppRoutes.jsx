
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import Onboarding1 from "../pages/auth/Onboarding1";
import Onboarding2 from "../pages/auth/Onboarding2";
import Onboarding3 from "../pages/auth/Onboarding3";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import OTP from "../pages/auth/OTP";
import ResetPassword from "../pages/auth/ResetPassword";
import PasswordChanged from "../pages/auth/PasswordChanged";

import Home from "../pages/home/Home";
import Search from "../pages/home/Search";
import Favorites from "../pages/home/Favorites";
import Settings from "../pages/home/Settings";
import EditProfile from "../pages/home/EditProfile";
import ChangePassword from "../pages/home/ChangePassword";
import ChangePhoneNumber from "../pages/home/ChangePhoneNumber";
import ChangeEmail from "../pages/home/ChangeEmail";
import Language from "../pages/home/Language";
import Help from "../pages/home/Help";
import PrivacyPolicy from "../pages/home/PrivacyPolicy";
import ContactUs from "../pages/home/ContactUs";
import AboutApp from "../pages/home/AboutApp";
import Notifications from "../pages/home/Notifications";

import Profile from "../pages/profile/Profile";
import MyProperties from "../pages/owner/MyProperties";

import AddProperty from "../pages/property/AddProperty";
import EditProperty from "../pages/property/EditProperty";
import PropertyDetails from "../pages/property/PropertyDetails";
import LocationMap from "../pages/property/LocationMap";
import OwnerViewingRequests from "../pages/owner/OwnerViewingRequests";
import MyRequests from "../pages/tenant/MyRequests";
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
      <Routes>
        {/* Onboarding */}
        <Route path="/" element={<Navigate to="/onboarding1" replace />} />
        <Route path="/onboarding1" element={<Onboarding1 />} />
        <Route path="/onboarding2" element={<Onboarding2 />} />
        <Route path="/onboarding3" element={<Onboarding3 />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<OTP />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/password-changed" element={<PasswordChanged />} />

        {/* Pages available to both account types */}
        <Route path="/home" element={protectedPage(Home)} />   <Route path="/search" element={protectedPage(Search)} />
        <Route path="/property-details" element={protectedPage(PropertyDetails)} />
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
        <Route path="*" element={<Navigate to="/home" replace />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
