import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaHome,
  FaPlus,
  FaHeart,
  FaCog,
  FaSignOutAlt,
  FaSearch,
  FaClipboardList,
  FaEdit,
  FaArrowLeft,
} from "react-icons/fa";

import BottomNavigation from "../../components/home/BottomNavigation";
import { useLanguage } from "../../context/LanguageContext.jsx";
import "../../styles/profile.css";

const DEFAULT_USER = {
  fullName: "أحمد محمد",
  phone: "01012345678",
  email: "owner@example.com",
  accountType: "مالك",
  profileImage: "",
};

function Profile() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const isArabic = language === "ar" || language === "العربية";

  const [user, setUser] = useState(DEFAULT_USER);
  const [profileImage, setProfileImage] = useState("/images/profile.jpg");

  // دالة لجلب البيانات والصورة تماماً مثل صفحة الإعدادات
  useEffect(() => {
    const loadUserData = () => {
  const savedUser = localStorage.getItem("baytakUser");

  if (!savedUser) {
    setUser(DEFAULT_USER);
    setProfileImage("/images/profile.jpg");
    return;
  }

  try {
    const parsedUser = JSON.parse(savedUser);

    const userId =
      parsedUser.uid || parsedUser.id || parsedUser.email;

    const imageKey = `baytakProfileImage_${userId}`;
    const savedImage = localStorage.getItem(imageKey);

    setUser({
      fullName:
        parsedUser.fullName ||
        parsedUser.name ||
        parsedUser.displayName ||
        DEFAULT_USER.fullName,

      phone: parsedUser.phone || "",

      email: parsedUser.email || "",

      accountType:
        parsedUser.accountType || DEFAULT_USER.accountType,
    });

    // صورة الحساب الحالي فقط
    setProfileImage(
      parsedUser.profileImage ||
        savedImage ||
        "/images/profile.jpg"
    );
  } catch (error) {
    console.error("Error loading user data:", error);
    setProfileImage("/images/profile.jpg");
  }
};

    loadUserData();

    window.addEventListener("storage", loadUserData);
    return () => {
      window.removeEventListener("storage", loadUserData);
    };
  }, []);

  const isOwner = user.accountType === "مالك";

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      window.alert(t.invalidImageFile);
      event.target.value = "";
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const maxSize = 512;
        const scale = Math.min(
          1,
          maxSize / Math.max(image.width, image.height)
        );

        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);

        const context = canvas.getContext("2d");
        if (!context) throw new Error("Canvas context unavailable");

        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        const compressedImage = canvas.toDataURL("image/jpeg", 0.82);
        
        // حفظ الصورة في المفتاحين لضمان التزامن الكامل مع الإعدادات
        localStorage.setItem("baytakProfileImage", compressedImage);
        
        const savedUser = JSON.parse(
  localStorage.getItem("baytakUser") || "{}"
);

const userId =
  savedUser.uid || savedUser.id || savedUser.email;

if (!userId) {
  throw new Error("User ID not found");
}

const imageKey = `baytakProfileImage_${userId}`;

localStorage.setItem(imageKey, compressedImage);

const updatedUser = {
  ...savedUser,
  profileImage: compressedImage,
};

localStorage.setItem(
  "baytakUser",
  JSON.stringify(updatedUser)
);

setProfileImage(compressedImage);
      } catch (error) {
        console.error("Error saving profile image:", error);
        window.alert(t.imageSaveFailed);
      } finally {
        URL.revokeObjectURL(imageUrl);
        event.target.value = "";
      }
    };

    image.onerror = () => {
      URL.revokeObjectURL(imageUrl);
      event.target.value = "";
      window.alert(t.imageOpenFailed);
    };

    image.src = imageUrl;
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm(
      t.confirmLogout ||
        (isArabic
          ? "هل أنت متأكد أنك تريد تسجيل الخروج؟"
          : "Are you sure you want to log out?")
    );

    if (confirmLogout) navigate("/login");
  };

  const renderAction = (label, Icon, path) => (
    <button
      key={path}
      type="button"
      className="profile-action"
      onClick={() => navigate(path)}
    >
      <div className="profile-action-icon">
        <Icon />
      </div>

      <span>{label}</span>

      <FaArrowLeft className="profile-action-arrow" />
    </button>
  );

  const ownerActions = [
    [t.myProperties || (isArabic ? "عقاراتي" : "My Properties"), FaHome, "/my-properties"],
    [t.addProperty || (isArabic ? "إضافة عقار" : "Add Property"), FaPlus, "/add-property"],
    [t.editProfile || (isArabic ? "تعديل الملف الشخصي" : "Edit Profile"), FaEdit, "/edit-profile"],
    [t.favorites || (isArabic ? "المفضلة" : "Favorites"), FaHeart, "/favorites"],
    [t.settings || (isArabic ? "الإعدادات" : "Settings"), FaCog, "/settings"],
  ];

  const tenantActions = [
    [t.searchProperty || (isArabic ? "البحث عن عقار" : "Search Properties"), FaSearch, "/search"],
    [t.favorites || (isArabic ? "المفضلة" : "Favorites"), FaHeart, "/favorites"],
    [t.myRequests || (isArabic ? "طلباتي" : "My Requests"), FaClipboardList, "/my-requests"],
    [t.editProfile || (isArabic ? "تعديل الملف الشخصي" : "Edit Profile"), FaEdit, "/edit-profile"],
    [t.settings || (isArabic ? "الإعدادات" : "Settings"), FaCog, "/settings"],
  ];

  return (
    <div
      className={`profile-page ${isOwner ? "owner-profile" : "tenant-profile"}`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <header className="profile-header">
        <h1>{t.myAccount}</h1>
      </header>

      <main className="profile-main">
        <div className="profile-image-container">
          <div className="profile-image">
            <img
              src={profileImage}
              alt={t.profilePicture || (isArabic ? "الصورة الشخصية" : "Profile picture")}
              onError={(event) => {
                const fallback = `${window.location.origin}/images/profile.jpg`;
                if (event.currentTarget.src !== fallback) {
                  event.currentTarget.src = "/images/profile.jpg";
                }
              }}
            />

            <button
              type="button"
              className="profile-image-edit"
              aria-label={t.changeProfilePicture || (isArabic ? "تغيير الصورة الشخصية" : "Change profile picture")}
              title={t.changeProfilePicture || (isArabic ? "تغيير الصورة الشخصية" : "Change profile picture")}
              onClick={() => fileInputRef.current?.click()}
            >
              <FaEdit />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="profile-image-input"
              aria-label={t.chooseProfilePicture || (isArabic ? "اختيار صورة شخصية" : "Choose profile picture")}
              onChange={handleImageChange}
            />
          </div>
        </div>

        <h2 className="profile-name">{user.fullName}</h2>

        <div className="profile-account-type">
          <span>
            {isOwner
              ? t.owner || (isArabic ? "مالك" : "Owner")
              : t.tenant || (isArabic ? "مستأجر" : "Tenant")}
          </span>
          {isOwner ? <FaHome /> : <FaUser />}
        </div>

        <section className="profile-contact-card">
          <div className="profile-contact-item">
            <div className="profile-contact-icon">
              <FaPhone />
            </div>

            <div className="profile-contact-text">
              <span>{t.phoneNumber}</span>
              <strong>{user.phone}</strong>
            </div>
          </div>

          <div className="profile-divider" />

          <div className="profile-contact-item">
            <div className="profile-contact-icon">
              <FaEnvelope />
            </div>

            <div className="profile-contact-text">
              <span>{t.email}</span>
              <strong>{user.email}</strong>
            </div>
          </div>
        </section>

        <section className="profile-actions">
          {(isOwner ? ownerActions : tenantActions).map(
            ([label, Icon, path]) => renderAction(label, Icon, path)
          )}

          <button
            type="button"
            className="profile-logout"
            onClick={handleLogout}
          >
            <div className="profile-logout-icon">
              <FaSignOutAlt />
            </div>

            <span>{t.logout}</span>

            <FaArrowLeft className="profile-action-arrow" />
          </button>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
}

export default Profile;