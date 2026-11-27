import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("Baytak AI Server is working!");
});

app.post("/api/ai-search", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({
        error: "Search query is required.",
      });
    }

    const response = await client.responses.create({
      model: "gpt-5-mini",
      input: `
أنت مساعد بحث عقارات لتطبيق Baytak.

حوّل طلب المستخدم إلى JSON فقط.

المعلومات المطلوبة:

listingType:
- "sale"
- "rent"
- null

type:
- "شقة"
- "فيلا"
- "دوبلكس"
- "بنتهاوس"
- "تاون هاوس"
- "مكتب"
- "مبنى تجاري"
- "عيادة"
- "محل"
- "متجر"
- "مصنع"
- "مخزن"
- "ورشة"
- "شاليه"
- "منتجع"
- "استراحة"
- "أرض"
- null

governorate: اسم المحافظة أو null
city: اسم المدينة أو المنطقة أو null

rooms: عدد الغرف أو null
bathrooms: عدد الحمامات أو null

minPrice: أقل سعر أو null
maxPrice: أعلى سعر أو null

minArea: أقل مساحة بالمتر المربع أو null
maxArea: أعلى مساحة بالمتر المربع أو null

إذا لم يذكر المستخدم معلومة، ضع null.

لا تخترع أي معلومات.

أرجع JSON فقط بهذا الشكل:

{
  "listingType": null,
  "type": null,
  "governorate": null,
  "city": null,
  "rooms": null,
  "bathrooms": null,
  "minPrice": null,
  "maxPrice": null,
  "minArea": null,
  "maxArea": null
}

طلب المستخدم:
${query}
      `,
    });

    const filters = JSON.parse(response.output_text);

    res.json(filters);
  } catch (error) {
    console.error("AI Search Error:", error);

    res.status(500).json({
      error: "AI search failed.",
    });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Baytak AI Server running on port ${PORT}`);
});