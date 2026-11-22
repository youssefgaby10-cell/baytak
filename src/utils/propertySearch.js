// منطق البحث والفلترة للعقارات (مشترك بين صفحة البحث وغيرها)

export const PROPERTY_TYPES = [
  { value: "apartment", ar: "شقة", en: "Apartment" },
  { value: "villa", ar: "فيلا", en: "Villa" },
  { value: "chalet", ar: "شاليه", en: "Chalet" },
  { value: "office", ar: "مكتب", en: "Office" },
  { value: "shop", ar: "محل", en: "Shop" },
  { value: "land", ar: "أرض", en: "Land" },
  { value: "duplex", ar: "دوبلكس", en: "Duplex" },
  { value: "penthouse", ar: "بنتهاوس", en: "Penthouse" },
  { value: "townhouse", ar: "تاون هاوس", en: "Townhouse" },
  { value: "factory", ar: "مصنع", en: "Factory" },
  { value: "warehouse", ar: "مخزن", en: "Warehouse" },
  { value: "clinic", ar: "عيادة", en: "Clinic" },
];

const STOP_WORDS = [
  "في", "من", "و", "ب", "عايز", "عاوز", "اريد", "ابحث", "عن", "عقار", "مع",
  "للسكن", "يكون", "علي", "على", "ال",
];

// توحيد الكتابة العربية (همزات، تاء مربوطة، ياء، تشكيل)
export const normalizeArabic = (text = "") =>
  String(text ?? "")
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/[ؤئ]/g, "ء")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[\u064B-\u065F\u0640]/g, "")
    .trim();

// نوع العرض: sale / rent / null (لو غير معروف)
export function getListingType(property) {
  if (property?.listingType === "sale" || property?.listingType === "rent") {
    return property.listingType;
  }

  const text = normalizeArabic(
    `${property?.title || ""} ${property?.description || ""}`
  );

  if (text.includes("ايجار")) return "rent";
  if (text.includes("بيع")) return "sale";

  return null;
}

// نوع العقار كـ value ثابت (apartment...) حتى لو كان مخزناً بالعربي
export function getPropertyTypeValue(property) {
  const raw = String(property?.type || "").trim();
  if (!raw) return null;

  const lower = raw.toLowerCase();
  const normalized = normalizeArabic(raw);

  const match = PROPERTY_TYPES.find(
    (item) =>
      item.value === lower ||
      item.en.toLowerCase() === lower ||
      normalizeArabic(item.ar) === normalized
  );

  return match ? match.value : null;
}

export function getPropertyTypeLabel(property, isArabic = true) {
  const value = getPropertyTypeValue(property);
  const match = PROPERTY_TYPES.find((item) => item.value === value);

  if (match) return isArabic ? match.ar : match.en;

  return property?.type || "";
}

// درجة تطابق العقار مع كلمات البحث (0 = غير مطابق)
export function scoreProperty(property, rawQuery) {
  const query = normalizeArabic(rawQuery);

  if (!query) return 1;

  const tokens = query.split(/\s+/).filter(Boolean);

  const meaningful = tokens.filter(
    (token) =>
      !STOP_WORDS.includes(token) && (token.length > 1 || /^\d$/.test(token))
  );

  // جملة كلها كلمات عامة (مثل "عقار") = نعرض كل العقارات
  if (meaningful.length === 0) return 1;

  const typeValue = getPropertyTypeValue(property);
  const typeMatch = PROPERTY_TYPES.find((item) => item.value === typeValue);

  const headText = normalizeArabic(
    [
      property?.title,
      property?.location,
      property?.city,
      property?.governorate,
      property?.type,
      typeMatch?.ar,
    ].join(" ")
  );

  const bodyText = normalizeArabic(
    `${property?.description || ""} ${property?.category || ""}`
  );

  let score = 0;

  for (const token of meaningful) {
    // رقم صغير (1-20) يقصد به عدد الغرف
    if (/^\d{1,2}$/.test(token)) {
      if (Number(property?.rooms) === Number(token)) score += 2;
      continue;
    }

    if (headText.includes(token)) score += 3;
    else if (bodyText.includes(token)) score += 1;
  }

  const listing = getListingType(property);
  if (listing === "rent" && query.includes("ايجار")) score += 1;
  if (listing === "sale" && query.includes("بيع")) score += 1;

  return score;
}

const toNumber = (value) => {
  if (value === "" || value == null) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const createdTime = (property) => {
  const time = Date.parse(property?.createdAt || "");
  return Number.isNaN(time) ? 0 : time;
};

// بحث + فلترة + ترتيب
export function searchProperties(properties = [], filters = {}) {
  const {
    q = "",
    listing = "",
    type = "",
    governorate = "",
    min = "",
    max = "",
    rooms = "",
    sort = "",
  } = filters;

  const minPrice = toNumber(min);
  const maxPrice = toNumber(max);
  const governorateKey = normalizeArabic(governorate);

  const scored = properties
    .map((property) => ({ property, score: scoreProperty(property, q) }))
    .filter(({ property, score }) => {
      if (score <= 0) return false;

      if (listing) {
        const propertyListing = getListingType(property);
        if (propertyListing && propertyListing !== listing) return false;
      }

      if (type && getPropertyTypeValue(property) !== type) return false;

      if (
        governorateKey &&
        normalizeArabic(property.governorate) !== governorateKey
      ) {
        return false;
      }

      if (minPrice !== null || maxPrice !== null) {
        const price = Number(property.price);
        if (!Number.isFinite(price)) return false;
        if (minPrice !== null && price < minPrice) return false;
        if (maxPrice !== null && price > maxPrice) return false;
      }

      if (rooms) {
        const propertyRooms = Number(property.rooms) || 0;

        if (String(rooms).endsWith("+")) {
          if (propertyRooms < parseInt(rooms, 10)) return false;
        } else if (propertyRooms !== Number(rooms)) {
          return false;
        }
      }

      return true;
    });

  const mode = sort || (String(q).trim() ? "relevance" : "newest");

  scored.sort((a, b) => {
    if (mode === "price_asc") return Number(a.property.price) - Number(b.property.price);
    if (mode === "price_desc") return Number(b.property.price) - Number(a.property.price);
    if (mode === "relevance" && b.score !== a.score) return b.score - a.score;

    return createdTime(b.property) - createdTime(a.property);
  });

  return scored.map(({ property }) => property);
}
