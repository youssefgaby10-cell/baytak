// أدوات بسيطة لأرقام الهاتف

// رقم صالح: من 10 إلى 15 رقماً (يقبل +، مسافات، شرطات)
export function isValidPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

// رقم واتساب بالصيغة الدولية (مصر): 0120... -> 20120...
export function toWhatsappNumber(phone) {
  const digits = String(phone || "").replace(/\D/g, "");

  if (digits.startsWith("20")) return digits;

  return digits.replace(/^0/, "20");
}
