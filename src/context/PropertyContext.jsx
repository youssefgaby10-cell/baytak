import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { db } from "../firebase/firebase";
import { useAuth } from "./AuthContext";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  query,
  where,
  writeBatch,
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
  const { user: authUser } = useAuth();
  const authUid = authUser?.uid || null;

  // طلبات المعاينة والإشعارات (محفوظة في Firestore وتتحدث لحظياً)
  const [tenantRequests, setTenantRequests] = useState([]);
  const [ownerRequests, setOwnerRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // الاشتراك اللحظي في طلبات المعاينة (كمستأجر وكمالك) والإشعارات الخاصة بالمستخدم
  useEffect(() => {
    if (!authUid) {
      setTenantRequests([]);
      setOwnerRequests([]);
      setNotifications([]);
      return undefined;
    }

    const mapDocs = (snapshot) =>
      snapshot.docs.map((docSnap) => ({ ...docSnap.data(), id: docSnap.id }));

    const logError = (label) => (error) =>
      console.error(`خطأ في جلب ${label}:`, error);

    const unsubscribers = [
      onSnapshot(
        query(collection(db, "viewingRequests"), where("tenantId", "==", authUid)),
        (snapshot) => setTenantRequests(mapDocs(snapshot)),
        logError("طلبات المعاينة (مستأجر)")
      ),
      onSnapshot(
        query(collection(db, "viewingRequests"), where("ownerId", "==", authUid)),
        (snapshot) => setOwnerRequests(mapDocs(snapshot)),
        logError("طلبات المعاينة (مالك)")
      ),
      onSnapshot(
        query(collection(db, "notifications"), where("userId", "==", authUid)),
        (snapshot) =>
          setNotifications(
            mapDocs(snapshot).sort((a, b) =>
              String(b.createdAt || "").localeCompare(String(a.createdAt || ""))
            )
          ),
        logError("الإشعارات")
      ),
    ];

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [authUid]);

  const viewingRequests = useMemo(() => {
    const merged = new Map();
    [...tenantRequests, ...ownerRequests].forEach((request) =>
      merged.set(request.id, request)
    );

    return [...merged.values()].sort((a, b) =>
      String(b.createdAt || "").localeCompare(String(a.createdAt || ""))
    );
  }, [tenantRequests, ownerRequests]);

  const unreadNotificationsCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  // جلب العقارات من Firestore بصورة حية (Real-time)
  useEffect(() => {
    const userId = getUserId(getCurrentUser());
    const favoriteIds = getFavoriteIds(userId);

    const unsubscribe = onSnapshot(collection(db, "properties"), (snapshot) => {
      const fetchedProperties = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          ...data,
          id: docSnap.id, // معرف Firestore الحقيقي (يأتي أخيراً حتى لا يستبدله أي id قديم داخل البيانات)
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
      const propertyWithoutId = { ...newProperty };
      delete propertyWithoutId.id; // معرف العقار هو معرف مستند Firestore
      const propertyData = {
        ...propertyWithoutId,
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
      return { success: true };
    } catch (error) {
      console.error("خطأ في تحديث العقار:", error);
      return { success: false };
    }
  };

  const toggleFavorite = (id) => {
    const userId = getUserId(getCurrentUser());

    if (!userId) {
      // الزائر (غير المسجل) يُحوَّل لتسجيل الدخول
      window.location.assign("/login");
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
      
      // حذف طلبات المعاينة المرتبطة بالعقار المحذوف (المالك فقط يملك صلاحية ذلك)
      try {
        if (authUid) {
          const related = await getDocs(
            query(
              collection(db, "viewingRequests"),
              where("ownerId", "==", authUid),
              where("propertyId", "==", String(id))
            )
          );

          if (!related.empty) {
            const cleanup = writeBatch(db);
            related.docs.forEach((docSnap) => cleanup.delete(docSnap.ref));
            await cleanup.commit();
          }
        }
      } catch (cleanupError) {
        console.error("تعذر حذف طلبات المعاينة المرتبطة:", cleanupError);
      }

      return { success: true };
    } catch (error) {
      console.error("خطأ أثناء حذف العقار:", error);
      return { success: false };
    }
  };

  // ===== طلبات المعاينة (Firestore) =====

  const buildNotification = ({ userId, type, requestId, request, actorName }) => ({
    userId,
    fromUserId: authUid,
    type,
    requestId,
    propertyId: String(request.propertyId || ""),
    propertyTitle: request.propertyTitle || "",
    actorName: actorName || "",
    appointment: request.appointment || "",
    read: false,
    createdAt: new Date().toISOString(),
  });

  const addViewingRequest = async (propertyId, appointment, note = "") => {
    const tenantId = authUid;

    if (!tenantId) {
      return {
        success: false,
        message: "تعذر تحديد حسابك. سجّل الدخول مرة أخرى.",
      };
    }

    const user = getCurrentUser() || {};

    const property = properties.find(
      (item) => String(item.id) === String(propertyId)
    );

    if (!property) {
      return {
        success: false,
        message: "العقار غير موجود.",
      };
    }

    if (!property.ownerId) {
      return {
        success: false,
        message: "لا يمكن طلب معاينة لهذا العقار حالياً.",
      };
    }

    if (String(property.ownerId) === tenantId) {
      return {
        success: false,
        message: "لا يمكنك طلب معاينة لعقارك أنت.",
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

    const duplicate = tenantRequests.some(
      (request) =>
        String(request.propertyId) === String(propertyId) &&
        ["pending", "accepted"].includes(request.status)
    );

    if (duplicate) {
      return {
        success: false,
        message: "لديك بالفعل طلب معاينة نشط لهذا العقار.",
      };
    }

    const now = new Date().toISOString();
    const tenantName = user.fullName || user.name || "مستأجر";

    const requestRef = doc(collection(db, "viewingRequests"));
    const requestData = {
      propertyId: String(property.id),
      propertyTitle: property.title || "",
      tenantId,
      tenantName,
      ownerId: String(property.ownerId),
      appointment,
      note: String(note).trim(),
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };

    const notificationRef = doc(collection(db, "notifications"));

    try {
      // الطلب والإشعار يُحفظان معاً أو لا يُحفظ أي منهما
      const batch = writeBatch(db);

      batch.set(requestRef, requestData);
      batch.set(
        notificationRef,
        buildNotification({
          userId: requestData.ownerId,
          type: "viewing_request",
          requestId: requestRef.id,
          request: requestData,
          actorName: tenantName,
        })
      );

      await batch.commit();

      return {
        success: true,
        message: "تم إرسال طلب المعاينة بنجاح.",
        request: { ...requestData, id: requestRef.id },
      };
    } catch (error) {
      console.error("خطأ في إرسال طلب المعاينة:", error);

      return {
        success: false,
        message: "تعذر إرسال الطلب. حاول مرة أخرى.",
      };
    }
  };

  const getTenantViewingRequests = () => {
    if (!authUid) return [];
    return viewingRequests.filter(
      (request) => String(request.tenantId) === authUid
    );
  };

  const getOwnerViewingRequests = () => {
    if (!authUid) return [];
    return viewingRequests.filter(
      (request) => String(request.ownerId) === authUid
    );
  };

  const updateViewingRequestStatus = async (requestId, status) => {
    const allowedStatuses = ["accepted", "rejected"];

    if (!allowedStatuses.includes(status)) {
      return { success: false, message: "حالة الطلب غير صحيحة." };
    }

    if (!authUid) {
      return { success: false, message: "تعذر تحديد حساب المالك." };
    }

    const request = viewingRequests.find(
      (item) => String(item.id) === String(requestId)
    );

    if (!request) return { success: false, message: "طلب المعاينة غير موجود." };

    if (String(request.ownerId) !== authUid) {
      return { success: false, message: "ليس لديك صلاحية تعديل هذا الطلب." };
    }

    if (request.status !== "pending") {
      return { success: false, message: "تم الرد على هذا الطلب من قبل." };
    }

    const ownerName =
      (getCurrentUser() || {}).fullName ||
      (getCurrentUser() || {}).name ||
      "المالك";

    try {
      const batch = writeBatch(db);

      batch.update(doc(db, "viewingRequests", request.id), {
        status,
        updatedAt: new Date().toISOString(),
      });

      batch.set(
        doc(collection(db, "notifications")),
        buildNotification({
          userId: String(request.tenantId),
          type: status === "accepted" ? "viewing_accepted" : "viewing_rejected",
          requestId: request.id,
          request,
          actorName: ownerName,
        })
      );

      await batch.commit();

      return {
        success: true,
        message: status === "accepted" ? "تم قبول طلب المعاينة." : "تم رفض طلب المعاينة.",
      };
    } catch (error) {
      console.error("خطأ في تحديث طلب المعاينة:", error);
      return { success: false, message: "تعذر تحديث الطلب. حاول مرة أخرى." };
    }
  };

  const cancelViewingRequest = async (requestId) => {
    if (!authUid) {
      return { success: false, message: "تعذر تحديد حساب المستأجر." };
    }

    const request = viewingRequests.find(
      (item) => String(item.id) === String(requestId)
    );

    if (!request) return { success: false, message: "طلب المعاينة غير موجود." };

    if (String(request.tenantId) !== authUid) {
      return { success: false, message: "ليس لديك صلاحية إلغاء هذا الطلب." };
    }

    if (!["pending", "accepted"].includes(request.status)) {
      return { success: false, message: "لا يمكن إلغاء هذا الطلب." };
    }

    const tenantName =
      (getCurrentUser() || {}).fullName ||
      (getCurrentUser() || {}).name ||
      request.tenantName ||
      "المستأجر";

    try {
      const batch = writeBatch(db);

      batch.update(doc(db, "viewingRequests", request.id), {
        status: "cancelled",
        updatedAt: new Date().toISOString(),
      });

      batch.set(
        doc(collection(db, "notifications")),
        buildNotification({
          userId: String(request.ownerId),
          type: "viewing_cancelled",
          requestId: request.id,
          request,
          actorName: tenantName,
        })
      );

      await batch.commit();

      return { success: true, message: "تم إلغاء طلب المعاينة." };
    } catch (error) {
      console.error("خطأ في إلغاء طلب المعاينة:", error);
      return { success: false, message: "تعذر إلغاء الطلب. حاول مرة أخرى." };
    }
  };

  // ===== الإشعارات =====

  const markNotificationRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, "notifications", String(notificationId)), {
        read: true,
      });
    } catch (error) {
      console.error("تعذر تحديث الإشعار:", error);
    }
  };

  const markAllNotificationsRead = async () => {
    const unread = notifications.filter((notification) => !notification.read);

    if (unread.length === 0) return;

    try {
      const batch = writeBatch(db);

      unread.forEach((notification) =>
        batch.update(doc(db, "notifications", notification.id), { read: true })
      );

      await batch.commit();
    } catch (error) {
      console.error("تعذر تحديث الإشعارات:", error);
    }
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
        notifications,
        unreadNotificationsCount,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
}

export function useProperties() {
  return useContext(PropertyContext);
}