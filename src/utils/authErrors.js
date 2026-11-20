// تحويل أخطاء Firebase Auth إلى رسائل مفهومة (عربي / إنجليزي)
export function getAuthErrorMessage(error, isArabic = true) {
  const code = error?.code || "";

  const messages = {
    "auth/invalid-credential": [
      "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
      "Incorrect email or password.",
    ],
    "auth/user-not-found": [
      "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
      "Incorrect email or password.",
    ],
    "auth/wrong-password": [
      "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
      "Incorrect email or password.",
    ],
    "auth/invalid-email": [
      "البريد الإلكتروني غير صالح.",
      "The email address is not valid.",
    ],
    "auth/email-already-in-use": [
      "هذا البريد الإلكتروني مسجل بالفعل.",
      "This email is already registered.",
    ],
    "auth/weak-password": [
      "كلمة المرور ضعيفة جداً.",
      "The password is too weak.",
    ],
    "auth/too-many-requests": [
      "محاولات كثيرة. حاول مرة أخرى بعد قليل.",
      "Too many attempts. Please try again later.",
    ],
    "auth/network-request-failed": [
      "تعذر الاتصال بالإنترنت. تأكد من الاتصال وحاول مرة أخرى.",
      "Network error. Check your connection and try again.",
    ],
    "auth/popup-closed-by-user": [
      "تم إغلاق نافذة تسجيل الدخول قبل الإكمال.",
      "The sign-in window was closed before finishing.",
    ],
    "auth/cancelled-popup-request": [
      "تم إغلاق نافذة تسجيل الدخول قبل الإكمال.",
      "The sign-in window was closed before finishing.",
    ],
    "auth/unauthorized-domain": [
      "هذا الدومين غير مصرح له في إعدادات Firebase.",
      "This domain is not authorized in Firebase settings.",
    ],
    "auth/operation-not-allowed": [
      "طريقة تسجيل الدخول هذه غير مفعّلة في Firebase.",
      "This sign-in method is not enabled in Firebase.",
    ],
    "auth/requires-recent-login": [
      "لأسباب أمنية، سجّل الدخول مرة أخرى ثم أعد المحاولة.",
      "For security, please log in again and retry.",
    ],
    "permission-denied": [
      "ليس لديك صلاحية لتنفيذ هذا الإجراء.",
      "You do not have permission to do this.",
    ],
  };

  const pair = messages[code];

  if (pair) return isArabic ? pair[0] : pair[1];

  return isArabic
    ? "حدث خطأ غير متوقع. حاول مرة أخرى."
    : "Something went wrong. Please try again.";
}
