import { useEffect } from "react";

// يضبط عنوان الصفحة والـ meta tags لكل صفحة (بدون أي مكتبة خارجية)
// ويرجّع القيم القديمة عند مغادرة الصفحة.

function applyTag(tag, matchAttr, matchValue, valueAttr, value) {
  if (!value) return () => {};

  let element = document.head.querySelector(
    `${tag}[${matchAttr}="${matchValue}"]`
  );

  if (element) {
    const previous = element.getAttribute(valueAttr);
    element.setAttribute(valueAttr, value);

    return () => {
      if (previous === null) element.removeAttribute(valueAttr);
      else element.setAttribute(valueAttr, previous);
    };
  }

  element = document.createElement(tag);
  element.setAttribute(matchAttr, matchValue);
  element.setAttribute(valueAttr, value);
  document.head.appendChild(element);

  return () => element.remove();
}

export function useSeo({
  title,
  description,
  image,
  noindex = false,
  type = "website",
  canonicalPath,
} = {}) {
  useEffect(() => {
    const undo = [];
    const previousTitle = document.title;

    if (title) document.title = title;

    // canonicalPath يوحّد الصفحات المكررة (مثل / و /home) على رابط واحد
    const canonicalUrl = `${window.location.origin}${canonicalPath ?? window.location.pathname}`;

    undo.push(applyTag("meta", "name", "description", "content", description));
    undo.push(applyTag("link", "rel", "canonical", "href", canonicalUrl));

    undo.push(applyTag("meta", "property", "og:title", "content", title));
    undo.push(
      applyTag("meta", "property", "og:description", "content", description)
    );
    undo.push(applyTag("meta", "property", "og:url", "content", canonicalUrl));
    undo.push(applyTag("meta", "property", "og:type", "content", type));

    // صور base64 لا تصلح كـ og:image، فنقبل الروابط الحقيقية فقط
    if (image && /^https?:\/\//i.test(image)) {
      undo.push(applyTag("meta", "property", "og:image", "content", image));
    }

    undo.push(
      applyTag(
        "meta",
        "name",
        "robots",
        "content",
        noindex ? "noindex, nofollow" : ""
      )
    );

    return () => {
      document.title = previousTitle;
      undo.forEach((restore) => restore());
    };
  }, [title, description, image, noindex, type, canonicalPath]);
}
