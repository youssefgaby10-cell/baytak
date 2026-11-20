import { auth } from "../firebase/firebase.js";

// يحوّل جملة البحث لكلمات مفتاحية عن طريق /api/ai-search (على السيرفر).
// أي مشكلة (زائر غير مسجل، السيرفر غير متاح...) يرجع الجملة الأصلية ببحث عادي.
export async function parseSearchWithAI(userQuery) {
  const query = String(userQuery ?? "").trim();

  if (!query) return userQuery;

  const user = auth.currentUser;

  // الزائر غير المسجل يستخدم البحث العادي
  if (!user) return userQuery;

  try {
    const token = await user.getIdToken();

    const response = await fetch("/api/ai-search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`AI search responded with ${response.status}`);
    }

    const data = await response.json();
    const keywords = String(data?.keywords ?? "").trim();

    return keywords || userQuery;
  } catch (error) {
    console.error("خطأ في البحث الذكي:", error);
    return userQuery; // لو حصل خطأ يرجع الكلمة الأصلية عادي
  }
}
