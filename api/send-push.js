// Vercel Serverless Function: /api/send-push
// يرسل إشعار موبايل (Firebase Cloud Messaging) بعد إنشاء إشعار داخل الموقع.
// يعمل بحساب الخدمة (Service Account) المخزّن كمتغير بيئة FIREBASE_SERVICE_ACCOUNT في Vercel.
// بدون أي مكتبات خارجية: توقيع JWT + طلبات REST.

import { createSign } from "node:crypto";

// مفتاح Firebase الخاص بالويب (عام بطبيعته)
const FIREBASE_WEB_API_KEY = "AIzaSyCvO2b_elpWibINBvk8So8QbWpurKHe5II";

const MAX_NOTIFICATION_AGE_MS = 2 * 60 * 1000; // لا نرسل إلا لإشعار حديث
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60 * 1000;
const MAX_TOKENS_PER_USER = 10;

const hits = new Map();

function isRateLimited(uid) {
  const now = Date.now();
  const recent = (hits.get(uid) || []).filter((time) => now - time < RATE_WINDOW_MS);

  if (recent.length >= RATE_LIMIT) {
    hits.set(uid, recent);
    return true;
  }

  recent.push(now);
  hits.set(uid, recent);
  return false;
}

function loadServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!raw) return null;

  try {
    const text = raw.trim().startsWith("{")
      ? raw
      : Buffer.from(raw, "base64").toString("utf-8");

    const account = JSON.parse(text);

    if (!account.client_email || !account.private_key || !account.project_id) {
      return null;
    }

    account.private_key = String(account.private_key).replace(/\\n/g, "\n");
    return account;
  } catch {
    return null;
  }
}

const base64url = (input) => Buffer.from(input).toString("base64url");

let cachedAdminToken = { value: "", expiresAt: 0 };

async function getAdminToken(account) {
  if (cachedAdminToken.value && Date.now() < cachedAdminToken.expiresAt - 60000) {
    return cachedAdminToken.value;
  }

  const now = Math.floor(Date.now() / 1000);

  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(
    JSON.stringify({
      iss: account.client_email,
      scope:
        "https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/firebase.messaging",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    })
  );

  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  const signature = signer.sign(account.private_key).toString("base64url");

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${header}.${claims}.${signature}`,
    }),
  });

  if (!response.ok) {
    throw new Error(`Google token request failed (${response.status})`);
  }

  const data = await response.json();

  cachedAdminToken = {
    value: data.access_token,
    expiresAt: Date.now() + (Number(data.expires_in) || 3600) * 1000,
  };

  return cachedAdminToken.value;
}

async function getCallerUid(idToken) {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_WEB_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    }
  );

  if (!response.ok) return null;

  const data = await response.json();
  return data?.users?.[0]?.localId || null;
}

const docsBase = (projectId) =>
  `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

const str = (fields, key) => fields?.[key]?.stringValue || "";

// نص الإشعار حسب نوعه
function buildMessage(type, data) {
  const title = data.propertyTitle || "عقار";

  switch (type) {
    case "viewing_request":
      return {
        title: "طلب معاينة جديد",
        body: `${data.actorName || "مستأجر"} طلب معاينة "${title}"`,
        url: "/owner-viewing-requests",
      };
    case "viewing_accepted":
      return {
        title: "تم قبول طلب المعاينة",
        body: `وافق المالك على طلب معاينة "${title}"`,
        url: "/my-requests",
      };
    case "viewing_rejected":
      return {
        title: "تم رفض طلب المعاينة",
        body: `اعتذر المالك عن طلب معاينة "${title}"`,
        url: "/my-requests",
      };
    case "viewing_cancelled":
      return {
        title: "تم إلغاء طلب معاينة",
        body: `${data.actorName || "المستأجر"} ألغى طلب معاينة "${title}"`,
        url: "/owner-viewing-requests",
      };
    default:
      return null;
  }
}

async function sendToToken(projectId, adminToken, token, message, tag) {
  const response = await fetch(
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          token,
          // رسالة بيانات فقط: الـ Service Worker يعرضها بنفسه (بدون تكرار)
          data: {
            title: message.title,
            body: message.body,
            url: message.url,
            tag,
          },
          webpush: { headers: { Urgency: "high", TTL: "86400" } },
        },
      }),
    }
  );

  if (response.ok) return "sent";

  const error = await response.json().catch(() => ({}));
  const status = error?.error?.status;
  const unregistered = (error?.error?.details || []).some(
    (detail) => detail?.errorCode === "UNREGISTERED"
  );

  if (status === "NOT_FOUND" || unregistered) return "gone";

  console.error("FCM send failed:", response.status, status);
  return "failed";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const account = loadServiceAccount();

  if (!account) {
    return res.status(503).json({ error: "Push is not configured" });
  }

  const authHeader = req.headers.authorization || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!idToken) return res.status(401).json({ error: "Login required" });

  let callerUid = null;

  try {
    callerUid = await getCallerUid(idToken);
  } catch (error) {
    console.error("Token check failed:", error);
  }

  if (!callerUid) return res.status(401).json({ error: "Invalid session" });

  if (isRateLimited(callerUid)) {
    return res.status(429).json({ error: "Too many requests" });
  }

  let body = req.body;

  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const notificationId = String(body?.notificationId || "");

  if (!/^[A-Za-z0-9]{10,40}$/.test(notificationId)) {
    return res.status(400).json({ error: "Invalid notification" });
  }

  try {
    const projectId = account.project_id;
    const adminToken = await getAdminToken(account);
    const authorization = { Authorization: `Bearer ${adminToken}` };

    // 1) قراءة الإشعار
    const notificationResponse = await fetch(
      `${docsBase(projectId)}/notifications/${notificationId}`,
      { headers: authorization }
    );

    if (notificationResponse.status === 404) {
      return res.status(404).json({ error: "Notification not found" });
    }

    if (!notificationResponse.ok) {
      return res.status(502).json({ error: "Could not read notification" });
    }

    const notification = await notificationResponse.json();
    const fields = notification.fields || {};

    // 2) التحقق: المرسل هو صاحب الطلب، والإشعار حديث، ولم يُرسل من قبل
    if (str(fields, "fromUserId") !== callerUid) {
      return res.status(403).json({ error: "Not allowed" });
    }

    const createdAt = Date.parse(str(fields, "createdAt"));

    if (!Number.isFinite(createdAt) || Date.now() - createdAt > MAX_NOTIFICATION_AGE_MS) {
      return res.status(410).json({ error: "Notification is too old" });
    }

    if (fields.pushedAt) {
      return res.status(409).json({ error: "Already sent" });
    }

    const message = buildMessage(str(fields, "type"), {
      propertyTitle: str(fields, "propertyTitle"),
      actorName: str(fields, "actorName"),
    });

    if (!message) return res.status(400).json({ error: "Unknown type" });

    // 3) حجز الإشعار (علامة pushedAt) بشرط عدم تغيّره، لمنع الإرسال المكرر
    const claim = await fetch(
      `${docsBase(projectId)}/notifications/${notificationId}?updateMask.fieldPaths=pushedAt&currentDocument.updateTime=${encodeURIComponent(notification.updateTime)}`,
      {
        method: "PATCH",
        headers: { ...authorization, "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: { pushedAt: { stringValue: new Date().toISOString() } },
        }),
      }
    );

    if (!claim.ok) {
      return res.status(409).json({ error: "Already sent" });
    }

    // 4) أجهزة المستلم
    const recipientUid = str(fields, "userId");

    const tokensResponse = await fetch(`${docsBase(projectId)}:runQuery`, {
      method: "POST",
      headers: { ...authorization, "Content-Type": "application/json" },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: "pushTokens" }],
          where: {
            fieldFilter: {
              field: { fieldPath: "uid" },
              op: "EQUAL",
              value: { stringValue: recipientUid },
            },
          },
          limit: MAX_TOKENS_PER_USER,
        },
      }),
    });

    if (!tokensResponse.ok) {
      return res.status(502).json({ error: "Could not read devices" });
    }

    const rows = await tokensResponse.json();

    const tokens = rows
      .filter((row) => row.document)
      .map((row) => decodeURIComponent(row.document.name.split("/").pop()));

    // 5) الإرسال، وتنظيف الأجهزة التي لم تعد صالحة
    let sent = 0;

    for (const token of tokens) {
      const result = await sendToToken(projectId, adminToken, token, message, notificationId);

      if (result === "sent") sent += 1;

      if (result === "gone") {
        await fetch(`${docsBase(projectId)}/pushTokens/${encodeURIComponent(token)}`, {
          method: "DELETE",
          headers: authorization,
        }).catch(() => {});
      }
    }

    return res.status(200).json({ sent, devices: tokens.length });
  } catch (error) {
    console.error("send-push error:", error);
    return res.status(500).json({ error: "Push failed" });
  }
}
