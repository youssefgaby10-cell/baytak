import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../firebase/firebase";import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot
} from "firebase/firestore";

const PropertyContext = createContext();

const defaultFeatures = {
  family: false,
  quiet: false,
  schools: false,
  hospitals: false,
  clinics: false,
  universities: false,
  transportation: false,
  metro: false,
  malls: false,
  restaurants: false,
  pharmacies: false,
  services: false,
  mainRoads: false,
  parks: false,
  clubs: false,
  security: false,
  parking: false,
  elevator: false,
  electricityMeter: false,
  waterMeter: false,
  gasMeter: false,
  modernFinish: false,
  furnished: false,
  airConditioning: false,
  garden: false,
  pool: false,
  balcony: false,
  terrace: false,
  seaView: false,
  newBuilding: false,
  spaciousReception: false,
  largeKitchen: false,
};

const withFeatures = (features = {}) => ({
  ...defaultFeatures,
  ...features,
});

const getCurrentUser = () => {
  try {
    const user = JSON.parse(localStorage.getItem("baytakUser"));
    return user && typeof user === "object" ? user : null;
  } catch {
    return null;
  }
};

const getUserId = (user) => {
  const id = user?.uid ?? user?.id ?? user?.email;
  return id === undefined || id === null || id === "" ? null : String(id);
};

const getFavoriteStorageKey = (userId) => `baytakFavorites_${userId}`;

const getFavoriteIds = (userId) => {
  if (!userId) return [];

  try {
    const savedFavorites = JSON.parse(
      localStorage.getItem(getFavoriteStorageKey(userId)) || "[]"
    );

    return Array.isArray(savedFavorites)
      ? savedFavorites.map(String)
      : [];
  } catch {
    return [];
  }
};

export function PropertyProvider({ children }) {
  const [properties, setProperties] = useState([]);
  const [viewingRequests, setViewingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // جلب العقارات من Firestore بصورة حية (Real-time)
  useEffect(() => {
    const userId = getUserId(getCurrentUser());
    const favoriteIds = getFavoriteIds(userId);

    const unsubscribe = onSnapshot(collection(db, "properties"), (snapshot) => {
      const fetchedProperties = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id, // استخدام معرف فايربيز الحقيقي
          ...data,
          isFavorite: favoriteIds.includes(String(docSnap.id)),
          features: withFeatures(data.features),
        };
      });

      setProperties(fetchedProperties);
      setLoading(false);
    }, (error) => {
      console.error("خطأ في جلب العقارات من السيرفر: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // إضافة عقار جديد إلى Firestore
  const addProperty = async (newProperty) => {
    try {
      const user = getCurrentUser();
      const propertyData = {
        ...newProperty,
        ownerId: getUserId(user),
        category: newProperty.category || "Residential",
        features: withFeatures(newProperty.features),
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, "properties"), propertyData);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("خطأ أثناء إضافة العقار:", error);
      return { success: false, message: "تعذر إضافة العقار، حاول مرة أخرى." };
    }
  };

  const updateProperty = async (updatedProperty) => {
    try {
      if (!updatedProperty.id) return;
      const propertyRef = doc(db, "properties", String(updatedProperty.id));
      
      const cleanData = { ...updatedProperty };
      delete cleanData.id; // لا نحفظ الـ id داخل الحقول

      await updateDoc(propertyRef, cleanData);
    } catch (error) {
      console.error("خطأ في تحديث العقار:", error);
    }
  };

  const toggleFavorite = (id) => {
    const userId = getUserId(getCurrentUser());

    if (!userId) {
      console.warn("يجب تسجيل الدخول أولاً لإضافة العقارات إلى المفضلة.");
      return;
    }

    const favoriteKey = getFavoriteStorageKey(userId);
    const currentFavoriteIds = getFavoriteIds(userId);
    const propertyId = String(id);

    const updatedFavoriteIds = currentFavoriteIds.includes(propertyId)
      ? currentFavoriteIds.filter((favoriteId) => favoriteId !== propertyId)
      : [...currentFavoriteIds, propertyId];

    localStorage.setItem(favoriteKey, JSON.stringify(updatedFavoriteIds));

    setProperties((prev) =>
      prev.map((property) => ({
        ...property,
        isFavorite: updatedFavoriteIds.includes(String(property.id)),
      }))
    );
  };

  const refreshFavorites = () => {
    const userId = getUserId(getCurrentUser());
    const favoriteIds = getFavoriteIds(userId);

    setProperties((prev) =>
      prev.map((property) => ({
        ...property,
        isFavorite: favoriteIds.includes(String(property.id)),
      }))
    );
  };

  const deleteProperty = async (id) => {
    try {
      await deleteDoc(doc(db, "properties", String(id)));
      
      // حذف طلبات المعاينة المرتبطة بالعقار المحذوف
      setViewingRequests((prev) =>
        prev.filter((request) => String(request.propertyId) !== String(id))
      );
    } catch (error) {
      console.error("خطأ أثناء حذف العقار:", error);
    }
  };

  // طلبات المعاينة (تظل محلية أو يمكن ربطها لاحقاً بـ Firestore حسب رغبتك)
  const addViewingRequest = (propertyId, appointment, note = "") => {
    const user = getCurrentUser();
    const tenantId = getUserId(user);

    if (!tenantId) {
      return {
        success: false,
        message: "تعذر تحديد حسابك. سجّل الدخول مرة أخرى.",
      };
    }

    const property = properties.find(
      (item) => String(item.id) === String(propertyId)
    );

    if (!property) {
      return {
        success: false,
        message: "العقار غير موجود.",
      };
    }

    if (!appointment || Number.isNaN(Date.parse(appointment))) {
      return {
        success: false,
        message: "من فضلك اختر موعد معاينة صحيحًا.",
      };
    }

    if (Date.parse(appointment) <= Date.now()) {
      return {
        success: false,
        message: "موعد المعاينة يجب أن يكون في المستقبل.",
      };
    }

    const duplicate = viewingRequests.some(
      (request) =>
        String(request.propertyId) === String(propertyId) &&
        String(request.tenantId) === tenantId &&
        ["pending", "accepted"].includes(request.status)
    );

    if (duplicate) {
      return {
        success: false,
        message: "لديك بالفعل طلب معاينة نشط لهذا العقار.",
      };
    }

    const request = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      propertyId: property.id,
      propertyTitle: property.title,
      tenantId,
      tenantName: user.name || user.fullName || "مستأجر",
      ownerId: property.ownerId ?? null,
      appointment,
      note: String(note).trim(),
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setViewingRequests((prev) => [request, ...prev]);

    return {
      success: true,
      message: "تم إرسال طلب المعاينة بنجاح.",
      request,
    };
  };

  const getTenantViewingRequests = () => {
    const tenantId = getUserId(getCurrentUser());
    if (!tenantId) return [];
    return viewingRequests.filter(
      (request) => String(request.tenantId) === tenantId
    );
  };

  const getOwnerViewingRequests = () => {
    const ownerId = getUserId(getCurrentUser());
    if (!ownerId) return [];
    return viewingRequests.filter(
      (request) =>
        request.ownerId !== null &&
        String(request.ownerId) === ownerId
    );
  };

  const updateViewingRequestStatus = (requestId, status) => {
    const allowedStatuses = ["accepted", "rejected"];
    if (!allowedStatuses.includes(status)) {
      return { success: false, message: "حالة الطلب غير صحيحة." };
    }

    const user = getCurrentUser();
    const ownerId = getUserId(user);
    if (!ownerId) return { success: false, message: "تعذر تحديد حساب المالك." };

    const request = viewingRequests.find(
      (item) => String(item.id) === String(requestId)
    );

    if (!request) return { success: false, message: "طلب المعاينة غير موجود." };

    if (request.ownerId === null || String(request.ownerId) !== ownerId) {
      return { success: false, message: "ليس لديك صلاحية تعديل هذا الطلب." };
    }

    setViewingRequests((prev) =>
      prev.map((item) =>
        String(item.id) === String(requestId)
          ? { ...item, status, updatedAt: new Date().toISOString() }
          : item
      )
    );

    return {
      success: true,
      message: status === "accepted" ? "تم قبول طلب المعاينة." : "تم رفض طلب المعاينة.",
    };
  };

  const cancelViewingRequest = (requestId) => {
    const tenantId = getUserId(getCurrentUser());
    if (!tenantId) return { success: false, message: "تعذر تحديد حساب المستأجر." };

    const request = viewingRequests.find(
      (item) => String(item.id) === String(requestId)
    );

    if (!request) return { success: false, message: "طلب المعاينة غير موجود." };
    if (String(request.tenantId) !== tenantId) {
      return { success: false, message: "ليس لديك صلاحية إلغاء هذا الطلب." };
    }

    setViewingRequests((prev) =>
      prev.map((item) =>
        String(item.id) === String(requestId)
          ? { ...item, status: "cancelled", updatedAt: new Date().toISOString() }
          : item
      )
    );

    return { success: true, message: "تم إلغاء طلب المعاينة." };
  };

  return (
    <PropertyContext.Provider
      value={{
        properties,
        setProperties,
        addProperty,
        updateProperty,
        toggleFavorite,
        refreshFavorites,
        deleteProperty,
        loading,

        viewingRequests,
        addViewingRequest,
        getTenantViewingRequests,
        getOwnerViewingRequests,
        updateViewingRequestStatus,
        cancelViewingRequest,
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
}

export function useProperties() {
  return useContext(PropertyContext);
}