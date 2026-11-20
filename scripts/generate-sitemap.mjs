// يولّد public/sitemap.xml قبل كل build (npm run build) ويضيف كل العقارات.
// لو فشل الاتصال بـ Firestore، بيسيب الملف القديم كما هو ولا يوقف الـ build.

import { existsSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SITE_URL = (process.env.SITE_URL || "https://baytak-7di4.vercel.app").replace(/\/$/, "");
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "baytak-6bf35";
const OUTPUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "sitemap.xml");

const STATIC_PATHS = ["/", "/login", "/register"];

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

async function fetchPropertyEntries() {
  const entries = [];
  let pageToken = "";

  for (let page = 0; page < 20; page += 1) {
    const url = new URL(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/properties`
    );
    url.searchParams.set("pageSize", "300");
    url.searchParams.append("mask.fieldPaths", "createdAt");
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Firestore responded with ${response.status}`);
    }

    const data = await response.json();

    for (const document of data.documents || []) {
      const id = document.name.split("/").pop();
      const createdAt = document.fields?.createdAt?.stringValue || "";
      entries.push({ id, lastmod: createdAt.slice(0, 10) });
    }

    pageToken = data.nextPageToken || "";
    if (!pageToken) break;
  }

  return entries;
}

async function main() {
  let properties = [];

  try {
    properties = await fetchPropertyEntries();
  } catch (error) {
    console.warn(`[sitemap] تعذر جلب العقارات (${error.message}).`);

    if (existsSync(OUTPUT)) {
      console.warn("[sitemap] تم الإبقاء على الملف الحالي.");
      return;
    }
  }

  const urls = [
    ...STATIC_PATHS.map((path) => `  <url><loc>${escapeXml(SITE_URL + path)}</loc></url>`),
    ...properties.map(({ id, lastmod }) =>
      `  <url><loc>${escapeXml(`${SITE_URL}/property/${id}`)}</loc>${
        /^\d{4}-\d{2}-\d{2}$/.test(lastmod) ? `<lastmod>${lastmod}</lastmod>` : ""
      }</url>`
    ),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;

  writeFileSync(OUTPUT, xml, "utf-8");
  console.log(`[sitemap] تم إنشاء sitemap.xml (${STATIC_PATHS.length + properties.length} رابط).`);
}

main().catch((error) => {
  // لا نوقف الـ build أبداً بسبب الـ sitemap
  console.warn("[sitemap] خطأ غير متوقع:", error);
});
