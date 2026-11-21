import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase/firebase.js";

/*
  AuthContext
  -----------
  Firebase Auth هو المصدر الوحيد لحالة تسجيل الدخول.
  كلمات المرور لا تُخزَّن في أي مكان في الموقع.
  بيانات الملف الشخصي (الاسم، الهاتف، نوع الحساب) في Firestore: users/{uid}.

  مفتاح "baytakUser" في localStorage ما زال موجوداً كنسخة مؤقتة (Cache)
  من بيانات الملف الشخصي فقط (بدون كلمة مرور) حتى تعمل باقي الصفحات
  التي تقرأه كما هي. لا يُعتمد عليه في الحماية.
*/

const AuthContext = createContext(null);

const CACHE_KEY = "baytakUser";
const ACCOUNT_TYPES = ["مالك", "مستأجر"];

const readCache = () => {
  try {
    const value = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
    return value && typeof value === "object" ? value : null;
  } catch {
    return null;
  }
};

const writeCache = (value) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(value));
  } catch (error) {
    console.error("Could not cache user profile:", error);
  }
};

const clearLegacyKeys = () => {
  // مفاتيح النظام القديم (كانت تحتوي كلمات مرور بنص عادي)
  localStorage.removeItem("baytakUsers");
  localStorage.removeItem("baytakPassword");
  localStorage.removeItem("baytakLoggedIn");
};

const buildProfile = (fbUser, stored, cached) => {
  const data = stored || {};
  const sameUser = cached && cached.uid === fbUser.uid;
  const fullName = data.fullName || data.name || fbUser.displayName || "";

  return {
    id: fbUser.uid,
    uid: fbUser.uid,
    fullName,
    name: fullName,
    email: (fbUser.email || data.email || "").toLowerCase(),
    phone: data.phone || "",
    accountType: data.accountType || "",
    profileImage:
      data.profileImage || (sameUser ? cached.profileImage : "") || "",
    photoURL: fbUser.photoURL || "",
    authProvider:
      fbUser.providerData?.[0]?.providerId === "google.com"
        ? "google"
        : "password",
  };
};

const fetchStoredProfile = async (uid) => {
  const snapshot = await getDoc(doc(db, "users", uid));
  return snapshot.exists() ? snapshot.data() : null;
};

const makeError = (code, extra = {}) => {
  const error = new Error(code);
  error.code = code;
  Object.assign(error, extra);
  return error;
};

export function AuthProvider({ children }) {
  const [state, setState] = useState({
    loading: true,
    user: null,
    profile: null,
  });

  // أثناء تنفيذ تسجيل دخول/إنشاء حساب بأنفسنا، نتجاهل حدث onAuthStateChanged
  // حتى لا يحدث تعارض بين الحالتين.
  const busy = useRef(false);

  const applySession = useCallback((fbUser, stored) => {
    const profile = buildProfile(fbUser, stored, readCache());
    writeCache(profile);
    setState({ loading: false, user: fbUser, profile });
    return profile;
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
    setState({ loading: false, user: null, profile: null });
  }, []);

  // استرجاع الجلسة عند فتح الموقع
  useEffect(() => {
    clearLegacyKeys();

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (busy.current) return;

      if (!fbUser) {
        clearSession();
        return;
      }

      try {
        const stored = await fetchStoredProfile(fbUser.uid);
        if (busy.current) return;
        applySession(fbUser, stored);
      } catch (error) {
        console.error("Could not load profile:", error);
        if (busy.current) return;
        applySession(fbUser, null);
      }
    });

    return unsubscribe;
  }, [applySession, clearSession]);

  const choosePersistence = (staySignedIn) =>
    setPersistence(
      auth,
      staySignedIn ? browserLocalPersistence : browserSessionPersistence
    );

  // إنشاء حساب جديد بالبريد وكلمة المرور
  const register = useCallback(
    async ({ fullName, email, phone, password, accountType }) => {
      if (!ACCOUNT_TYPES.includes(accountType)) {
        throw makeError("baytak/invalid-account-type");
      }

      busy.current = true;

      try {
        const credential = await createUserWithEmailAndPassword(
          auth,
          email.trim().toLowerCase(),
          password
        );

        try {
          await updateProfile(credential.user, {
            displayName: fullName.trim(),
          });

          await setDoc(doc(db, "users", credential.user.uid), {
            fullName: fullName.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            accountType,
            createdAt: new Date().toISOString(),
          });
        } catch (error) {
          // لو فشل حفظ البيانات، نمسح الحساب الناقص حتى لا يبقى حساب بدون ملف شخصي
          await credential.user.delete().catch(() => {});
          throw error;
        }

        // رابط تأكيد البريد (لو فشل الإرسال، يقدر المستخدم يطلب إعادة الإرسال من صفحة الدخول)
        let verificationSent = true;

        try {
          await sendEmailVerification(credential.user);
        } catch (error) {
          console.error("Could not send verification email:", error);
          verificationSent = false;
        }

        // بعد التسجيل يذهب المستخدم لصفحة تسجيل الدخول (ولا يدخل قبل تأكيد بريده)
        await signOut(auth);
        clearSession();

        return { verificationSent };
      } finally {
        busy.current = false;
      }
    },
    [clearSession]
  );

  // دخول بالبريد وكلمة المرور
  const login = useCallback(
    async ({ email, password, accountType, staySignedIn }) => {
      busy.current = true;

      try {
        await choosePersistence(staySignedIn);

        const credential = await signInWithEmailAndPassword(
          auth,
          email.trim().toLowerCase(),
          password
        );

        // لا يدخل أحد قبل تأكيد بريده الإلكتروني (حسابات Google مؤكدة تلقائياً)
        if (!credential.user.emailVerified) {
          await signOut(auth);
          clearSession();
          throw makeError("baytak/email-not-verified");
        }

        let stored = await fetchStoredProfile(credential.user.uid);

        if (!stored) {
          // حساب موجود في Firebase بدون ملف شخصي (مثلاً أُنشئ يدوياً)
          stored = {
            fullName: credential.user.displayName || "",
            email: credential.user.email || "",
            phone: "",
            accountType,
            createdAt: new Date().toISOString(),
          };
          await setDoc(doc(db, "users", credential.user.uid), stored);
        }

        if (stored.accountType !== accountType) {
          await signOut(auth);
          clearSession();
          throw makeError("baytak/role-mismatch", {
            actualType: stored.accountType,
          });
        }

        return applySession(credential.user, stored);
      } finally {
        busy.current = false;
      }
    },
    [applySession, clearSession]
  );

  // إعادة إرسال رابط تأكيد البريد (بالبريد وكلمة المرور، ثم يُسجَّل الخروج مباشرة)
  const resendVerificationEmail = useCallback(
    async ({ email, password }) => {
      busy.current = true;

      try {
        const credential = await signInWithEmailAndPassword(
          auth,
          email.trim().toLowerCase(),
          password
        );

        try {
          if (credential.user.emailVerified) {
            return { alreadyVerified: true };
          }

          await sendEmailVerification(credential.user);
          return { alreadyVerified: false };
        } finally {
          await signOut(auth).catch(() => {});
          clearSession();
        }
      } finally {
        busy.current = false;
      }
    },
    [clearSession]
  );

  // دخول بحساب Google
  const loginWithGoogle = useCallback(
    async ({ accountType, staySignedIn }) => {
      busy.current = true;

      try {
        await choosePersistence(staySignedIn);

        const credential = await signInWithPopup(auth, googleProvider);
        const fbUser = credential.user;

        let stored = await fetchStoredProfile(fbUser.uid);

        if (!stored) {
          stored = {
            fullName: fbUser.displayName || "",
            email: (fbUser.email || "").toLowerCase(),
            phone: "",
            accountType,
            createdAt: new Date().toISOString(),
          };
          await setDoc(doc(db, "users", fbUser.uid), stored);
        }

        if (stored.accountType !== accountType) {
          await signOut(auth);
          clearSession();
          throw makeError("baytak/role-mismatch", {
            actualType: stored.accountType,
          });
        }

        return applySession(fbUser, stored);
      } finally {
        busy.current = false;
      }
    },
    [applySession, clearSession]
  );

  const logout = useCallback(async () => {
    busy.current = true;

    try {
      await signOut(auth);
    } finally {
      busy.current = false;
      localStorage.removeItem("baytakStaySignedIn");
      clearSession();
    }
  }, [clearSession]);

  // تحديث بيانات الملف الشخصي (الاسم/الهاتف في Firestore، والصورة محلياً)
  const updateUserProfile = useCallback(
    async (patch) => {
      const fbUser = auth.currentUser;

      if (!fbUser) {
        throw makeError("baytak/not-signed-in");
      }

      const remote = {};
      if (typeof patch.fullName === "string") remote.fullName = patch.fullName;
      if (typeof patch.phone === "string") remote.phone = patch.phone;

      if (Object.keys(remote).length > 0) {
        await updateDoc(doc(db, "users", fbUser.uid), remote);

        if (remote.fullName && remote.fullName !== fbUser.displayName) {
          await updateProfile(fbUser, { displayName: remote.fullName });
        }
      }

      const current = readCache() || {};
      const next = {
        ...current,
        ...remote,
        ...(remote.fullName ? { name: remote.fullName } : {}),
        ...(typeof patch.profileImage === "string"
          ? { profileImage: patch.profileImage }
          : {}),
      };

      writeCache(next);
      setState((previous) => ({ ...previous, profile: next }));

      return next;
    },
    []
  );

  const value = useMemo(
    () => ({
      loading: state.loading,
      user: state.user,
      profile: state.profile,
      isLoggedIn: Boolean(state.user),
      register,
      login,
      loginWithGoogle,
      resendVerificationEmail,
      logout,
      updateUserProfile,
    }),
    [
      state,
      register,
      login,
      loginWithGoogle,
      resendVerificationEmail,
      logout,
      updateUserProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }

  return context;
}
