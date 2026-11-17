import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCamera,
  FaLock,
} from "react-icons/fa";

import { useLanguage } from "../../context/LanguageContext.jsx";
import "../../styles/EditProfile.css";

function EditProfile() {
  const { t } = useLanguage();

  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [accountType, setAccountType] = useState("مالك");

  const [profileImage, setProfileImage] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const savedUser = localStorage.getItem("baytakUser");

    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);

        setFullName(user.fullName || "");
        setPhone(user.phone || "");
        setEmail(user.email || "");
        setAccountType(user.accountType || "مالك");
        setProfileImage(user.profileImage || "");
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    }
  }, []);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert(t.invalidImage);
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        const canvas = document.createElement("canvas");

        const maxSize = 600;

        let width = image.width;
        let height = image.height;

        if (width > height) {
          if (width > maxSize) {
            height =
              (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width =
              (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");

        context.drawImage(
          image,
          0,
          0,
          width,
          height
        );

        const compressedImage =
          canvas.toDataURL(
            "image/jpeg",
            0.7
          );

        setProfileImage(compressedImage);
      };

      image.src = reader.result;
    };

    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const newErrors = {};

    if (!fullName.trim()) {
      newErrors.fullName =
        "يجب إدخال الاسم الكامل.";
    }

    if (!phone.trim()) {
      newErrors.phone =
        "يجب إدخال رقم الهاتف.";
    }

    if (!email.trim()) {
      newErrors.email =
        "يجب إدخال البريد الإلكتروني.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const savedUser =
        localStorage.getItem("baytakUser");

      let oldUser = {};

      if (savedUser) {
        oldUser = JSON.parse(savedUser);
      }

      const updatedUser = {
        ...oldUser,

        fullName: fullName.trim(),

        phone: phone.trim(),

        email: email.trim(),

        accountType: accountType,

        profileImage:
          profileImage ||
          oldUser.profileImage ||
          "",
      };

      localStorage.setItem(
        "baytakUser",
        JSON.stringify(updatedUser)
      );

      navigate("/settings");
    } catch (error) {
      console.error(
        "Error saving profile:",
        error
      );

      alert(
        "حدث خطأ أثناء حفظ البيانات. حاول اختيار صورة أصغر أو مختلفة."
      );
    }
  };

  const getInitial = () => {
    if (!fullName.trim()) {
      return "؟";
    }

    return fullName
      .trim()
      .charAt(0);
  };

  return (
    <div className="edit-profile-page">
      <div className="edit-profile-header">
        <button
          type="button"
          className="edit-profile-back-btn"
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft />
        </button>

        <h1>{t.editProfile}</h1>
      </div>

      <div className="profile-picture-section">
        <div className="profile-picture">
          {profileImage ? (
            <img
              src={profileImage}
              alt="Profile"
              className="profile-image"
            />
          ) : (
            <div className="profile-placeholder">
              <span>
                {fullName
                  ? fullName.charAt(0)
                  : getInitial()}
              </span>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="profile-image-input"
          onChange={handleImageChange}
        />

        <button
          type="button"
          className="change-photo-btn"
          onClick={() =>
            fileInputRef.current?.click()
          }
        >
          {t.changePhoto}
          <FaCamera />
        </button>
      </div>

      <div className="edit-profile-form">
        <div className="form-group">
          <label htmlFor="fullName">
            {t.fullName}
          </label>

          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);

              if (errors.fullName) {
                setErrors({
                  ...errors,
                  fullName: "",
                });
              }
            }}
            placeholder="الاسم الكامل"
          />

          {errors.fullName && (
            <span className="edit-profile-error">
              {errors.fullName}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="phone">
            {t.phoneNumber}
          </label>

          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);

              if (errors.phone) {
                setErrors({
                  ...errors,
                  phone: "",
                });
              }
            }}
            placeholder="رقم الهاتف"
          />

          {errors.phone && (
            <span className="edit-profile-error">
              {errors.phone}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email">
            {t.email}
          </label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);

              if (errors.email) {
                setErrors({
                  ...errors,
                  email: "",
                });
              }
            }}
            placeholder="البريد الإلكتروني"
          />

          {errors.email && (
            <span className="edit-profile-error">
              {errors.email}
            </span>
          )}
        </div>

        <div className="form-group">
          <label>{t.accountType}</label>

          <div className="account-type">
            <span>
              {accountType === "مستأجر"
                ? "🏠 مستأجر"
                : "🏢 مالك"}
            </span>

            <FaLock />
          </div>
        </div>

        <button
  type="button"
  className="save-profile-btn"
  onClick={handleSave}
>
  حفظ التعديلات
</button>

        <button
          type="button"
          className="cancel-profile-btn"
          onClick={() => navigate(-1)}
        >
          {t.cancel}
        </button>
      </div>
    </div>
  );
}

export default EditProfile;