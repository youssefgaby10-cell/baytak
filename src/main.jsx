import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { PropertyProvider } from "./context/PropertyContext";

// بعد كل نشر جديد على Vercel، ملفات الموقع القديمة (JS/CSS) بتتمسح من السيرفر.
// لو فيه تاب مفتوح من النسخة القديمة وطلب جزء اتمسح، بنعيد تحميل الصفحة مرة واحدة
// علشان تجيب النسخة الجديدة (بحد أقصى مرة كل 10 ثواني لتفادي حلقة إعادة التحميل).
window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();

  const key = "baytakReloadedForNewVersion";
  const lastReload = Number(sessionStorage.getItem(key) || 0);

  if (Date.now() - lastReload > 10000) {
    sessionStorage.setItem(key, String(Date.now()));
    window.location.reload();
  }
});

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>

    <LanguageProvider>

      <ThemeProvider>

        <AuthProvider>

          <PropertyProvider>

            <App />

          </PropertyProvider>

        </AuthProvider>

      </ThemeProvider>

    </LanguageProvider>

  </React.StrictMode>
);