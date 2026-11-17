import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

export async function parseSearchWithAI(userQuery) {
  try {
    const prompt = `
أنت مساعد عقاري لموقع "بيتَك". حول جملة البحث التالية إلى كلمات مفتاحية قصيرة جداً ومباشرة للبحث في قاعدة البيانات (حول الأرقام المكتوبة بالحروف إلى أرقام مثل: تلات -> 3، واحذف كلمات مثل: للبيع، للإيجار، بسعر أقل من، مليون، غرف).
مثال: "شقة للبيع في مدينة نصر تلات غرف" -> "شقة مدينة نصر 3"
مثال: "فيلا للبيع في التجمع الخامس" -> "فيلا التجمع الخامس"
أرجع الكلمات المفتاحية فقط بدون أي علامات أو شرح.
الجملة: "${userQuery}"
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("خطأ في الذكاء الاصطناعي:", error);
    return userQuery; // لو حصل خطأ يرجع الكلمة الأصلية عادي
  }
}