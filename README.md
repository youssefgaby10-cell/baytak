# Baytak | بيتك

منصة عقارية لعرض والبحث عن الشقق والفيلات والمحلات والأراضي للبيع والإيجار في مصر.

**الموقع:** https://baytak-7di4.vercel.app

## التقنيات

- React + Vite + React Router
- Firebase: Authentication (بريد + Google) و Firestore
- Vercel: الاستضافة و Serverless Function للبحث الذكي (`api/ai-search.js`)
- Gemini API: تحويل جملة البحث إلى كلمات مفتاحية

## التشغيل محلياً

```bash
npm install
npm run dev
```

> البحث الذكي (`/api/ai-search`) يعمل على Vercel فقط. محلياً يرجع البحث العادي تلقائياً.

## أوامر مفيدة

| الأمر | الوظيفة |
|---|---|
| `npm run dev` | تشغيل نسخة التطوير |
| `npm run build` | بناء النسخة النهائية (يولّد `public/sitemap.xml` تلقائياً قبل البناء) |
| `npm run lint` | فحص الكود |

## إعداد Firebase (مرة واحدة)

1. **Authentication ← Sign-in method:** فعّل Email/Password و Google.
2. **Authentication ← Settings ← Authorized domains:** أضف دومين الموقع.
3. **Firestore ← Rules:** انسخ محتوى `firestore.rules` واضغط Publish.

## الإعداد على Vercel

- **Environment Variables:** أضف `GEMINI_API_KEY` ثم اعمل Redeploy.
- **كل `git push` على `main`** يُنشر تلقائياً.

## هيكل المشروع

```
api/            دوال Vercel (البحث الذكي)
scripts/        سكربت توليد sitemap.xml
public/         ملفات ثابتة (صور، robots.txt، sitemap.xml)
src/context/    Auth، العقارات والطلبات والإشعارات، اللغة، الثيم
src/pages/      صفحات الموقع
src/routes/     المسارات وحماية الصفحات
firestore.rules قواعد أمان Firestore
```

## ملاحظات أمان

- لا تُرفع ملفات `.env` أبداً.
- مفتاح Firebase في `src/firebase/firebase.js` عام بطبيعته، والحماية الحقيقية في `firestore.rules`.
