// ضغط الصور قبل حفظها داخل Firestore.
// حجم الـ document في Firestore أقصاه 1MB، وصورة الموبايل العادية 3–8MB،
// فبنصغّرها هنا (أطول ضلع 1000px) ونخفض الجودة لحد ما الحجم يبقى مناسب.

const MAX_SIDE = 1000;
const TARGET_BYTES = 100 * 1024; // حوالي 100KB للصورة الواحدة
const MIN_QUALITY = 0.45;

// الحجم التقريبي بالبايت لنص data URL
export const dataUrlBytes = (dataUrl = "") =>
  Math.ceil((dataUrl.length * 3) / 4);

const loadImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image could not be loaded"));
    image.src = url;
  });

export async function compressImageFile(file) {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await loadImage(objectUrl);

    const scale = Math.min(
      1,
      MAX_SIDE / Math.max(image.naturalWidth, image.naturalHeight)
    );

    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    context.fillStyle = "#ffffff"; // خلفية بيضاء للصور الشفافة (PNG)
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    let quality = 0.8;
    let result = canvas.toDataURL("image/jpeg", quality);

    while (dataUrlBytes(result) > TARGET_BYTES && quality > MIN_QUALITY) {
      quality = Math.max(MIN_QUALITY, quality - 0.1);
      result = canvas.toDataURL("image/jpeg", quality);
    }

    return result;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
