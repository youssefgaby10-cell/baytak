import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaEllipsisV,
  FaHeadset,
  FaPhone,
  FaEnvelope,
  FaPaperPlane,
  FaMapMarkerAlt,
} from "react-icons/fa";
import emailjs from "@emailjs/browser";
import ReCAPTCHA from "react-google-recaptcha";

import { useLanguage } from "../../context/LanguageContext.jsx";
import "../../styles/ContactUs.css";

function ContactUs() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false); // حالة التحقق من الروبوت

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!name.trim() || !subject.trim() || !message.trim()) {
      alert(t.contactFillRequired || "يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    // شرط التحقق من الكابتشا
    if (!captchaVerified) {
      alert("يرجى تأكيد أنك لست روبوتاً أولاً!");
      return;
    }

    setLoading(true);

    const templateParams = {
      user_name: name,
      subject: subject,
      message: message,
      from_email: "youssefgaby10@gmail.com",
    };

    emailjs
      .send(
        "service_hpt27ka",
        "template_2wxxpuw",
        templateParams,
        "A8NNO4OW7LRybLfG1"
      )
      .then(
        (result) => {
          setLoading(false);
          alert("تم إرسال رسالتك بنجاح وستصل إلى بريدك قريباً!");
          setName("");
          setSubject("");
          setMessage("");
          setCaptchaVerified(false); // إعادة تعيين الكابتشا بعد الإرسال
        },
        (error) => {
          setLoading(false);
          alert("حدث خطأ أثناء الإرسال، برجاء المحاولة مرة أخرى.");
          console.error(error);
        }
      );
  };

  return (
    <div className="contact-page">

      <div className="contact-header">
        <button
          className="contact-back-btn"
          onClick={() => navigate(-1)}
          type="button"
        >
          <FaArrowRight />
        </button>
        <h1>{t.contactUs}</h1>
        <button className="contact-more-btn" type="button">
          <FaEllipsisV />
        </button>
      </div>

      <div className="contact-hero">
        <div className="contact-hero-circle">
          <div className="contact-headset">
            <FaHeadset />
          </div>
        </div>
        <h2>{t.howCanWeHelp}</h2>
        <p>{t.supportAvailability}</p>
      </div>

      <div className="contact-card">
        <div className="contact-card-icon"><FaPhone /></div>
        <span className="contact-card-label">{t.phoneNumber}</span>
        <a href="tel:+201279031331" className="contact-card-value">+20 12 79031331</a>
      </div>

      <div className="contact-card">
        <div className="contact-card-icon"><FaEnvelope /></div>
        <span className="contact-card-label">{t.email}</span>
        <a href="mailto:youssefgaby10@gmail.com" className="contact-card-value">youssefgaby10@gmail.com</a>
      </div>

      <form onSubmit={handleSendMessage} className="contact-form-card">
        <h2>{t.sendUsMessage}</h2>

        <div className="contact-form-group">
          <label>{t.fullName}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال: أحمد محمد"
          />
        </div>

        <div className="contact-form-group">
          <label>{t.messageSubject}</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="بخصوص أي عقار؟"
          />
        </div>

        <div className="contact-form-group">
          <label>{t.yourMessage}</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="اكتب تفاصيل استفسارك هنا..."
            rows="5"
          />
        </div>

        {/* مربع reCAPTCHA */}
        <div style={{ margin: "20px 0", display: "flex", justifyContent: "center" }}>
          <ReCAPTCHA
            sitekey="6LdDHCIuAAAAAKESaC0_FH_twfDhlOaXIwaiZ7S2"
            theme="dark"
            onChange={(value) => {
              if (value) setCaptchaVerified(true);
            }}
            onExpired={() => setCaptchaVerified(false)}
          />
        </div>

        <button
          type="submit"
          className="contact-send-btn"
          disabled={loading}
        >
          <FaPaperPlane />
          <span>{loading ? "جاري الإرسال..." : t.sendMessage}</span>
        </button>

        <button
          type="button"
          className="contact-location-card"
          onClick={() => {
            const address = encodeURIComponent(
              "شارع المسيري، عند البسطة، أمام كنيسة مار يوحنا الحبيب"
            );
            window.open(
              `https://www.google.com/maps/search/?api=1&query=${address}`,
              "_blank"
            );
          }}
        >
          <div className="contact-location-icon">
            <FaMapMarkerAlt />
          </div>
          <div className="contact-location-text">
            <h3>{t.mainLocation}</h3>
            <p>{t.contactLocationAddress}</p>
            <span>{t.openGoogleMaps}</span>
          </div>
        </button>
      </form>

    </div>
  );
}

export default ContactUs;