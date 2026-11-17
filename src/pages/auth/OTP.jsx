import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaShieldAlt } from "react-icons/fa";

import { useLanguage } from "../../context/LanguageContext.jsx";
import "../../styles/OTP.css";

const OTP_API =
  "https://baytak-otp.youssefgaby10.workers.dev";

function OTP() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // إرسال OTP عند فتح صفحة التحقق
  useEffect(() => {
    const savedEmail = sessionStorage.getItem(
      "baytakResetEmail"
    );

    if (!savedEmail) {
      navigate("/forgot-password");
      return;
    }

    setEmail(savedEmail);

    const sendCode = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${OTP_API}/send-otp`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: savedEmail.trim().toLowerCase(),
            }),
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to send OTP."
          );
        }

        setMessage(
          "تم إرسال كود التحقق إلى بريدك الإلكتروني."
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    sendCode();
  }, [navigate]);

  // التحقق من OTP باستخدام Cloudflare Worker
  const handleVerify = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!/^\d{6}$/.test(otp)) {
      setError("أدخل كود التحقق المكوّن من 6 أرقام.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${OTP_API}/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            code: otp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success || !data.verified) {
        throw new Error(
          data.message || "كود التحقق غير صحيح."
        );
      }

      sessionStorage.setItem(
        "baytakOTPVerified",
        "true"
      );

      navigate("/reset-password");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // إعادة إرسال OTP
  const handleResend = async () => {
    setError("");
    setMessage("");
    setOtp("");
    setLoading(true);

    try {
      const response = await fetch(
        `${OTP_API}/send-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to resend OTP."
        );
      }

      setMessage("تم إرسال كود جديد إلى بريدك الإلكتروني.");

      document.getElementById("otp-0")?.focus();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // OTP input
  const handleOTPChange = (index, value) => {
    const number = value.replace(/\D/g, "").slice(-1);

    const otpArray = otp.split("");
    otpArray[index] = number;

    setOtp(otpArray.join("").slice(0, 6));

    if (error) setError("");

    if (number && index < 5) {
      document
        .getElementById(`otp-${index + 1}`)
        ?.focus();
    }
  };

  // Backspace
  const handleKeyDown = (event, index) => {
    if (
      event.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      document
        .getElementById(`otp-${index - 1}`)
        ?.focus();
    }
  };

  return (
    <div className="verify-otp-page" dir="rtl">
      <button
        className="verify-back-btn"
        type="button"
        onClick={() => navigate("/forgot-password")}
      >
        <FaArrowLeft />
      </button>

      <div className="verify-header">
        <div className="verify-icon">
          <FaShieldAlt />
        </div>

        <h1>{t.verifyAccount}</h1>

        <p>{t.enterSixDigitCode}</p>

        {email && (
          <strong className="verify-email">
            {email}
          </strong>
        )}
      </div>

      <form
        className="verify-card"
        onSubmit={handleVerify}
      >
        <label className="verify-label">
          {t.verificationCode}
        </label>

        <div className="otp-boxes" dir="ltr">
          {Array.from({ length: 6 }).map((_, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              className="otp-box"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              value={otp[index] || ""}
              onChange={(event) =>
                handleOTPChange(index, event.target.value)
              }
              onKeyDown={(event) =>
                handleKeyDown(event, index)
              }
            />
          ))}
        </div>

        {error && (
          <div className="verify-error" role="alert">
            {error}
          </div>
        )}

        {message && (
          <div className="verify-success" role="status">
            {message}
          </div>
        )}

        <button
          className="verify-btn"
          type="submit"
          disabled={loading}
        >
          {loading
            ? "جارٍ التحقق..."
            : t.confirmCode}
        </button>

        <button
          className="resend-btn"
          type="button"
          onClick={handleResend}
          disabled={loading}
        >
          {loading
            ? "انتظر..."
            : t.resendCode}
        </button>
      </form>
    </div>
  );
}

export default OTP;