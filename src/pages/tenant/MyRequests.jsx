
import { useState } from "react";
import {
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaBan,
  FaInbox,
} from "react-icons/fa";
import { useProperties } from "../../context/PropertyContext";
import { useLanguage } from "../../context/LanguageContext";
import "./MyRequests.css";
import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

function MyRequests() {
  const {
    getTenantViewingRequests,
    cancelViewingRequest,
  } = useProperties();

  const { language } = useLanguage();
  const isArabic = language === "ar";
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [refresh, setRefresh] = useState(0);

  const requests = getTenantViewingRequests();

  const statusInfo = {
    pending: {
      label: isArabic ? "قيد الانتظار" : "Pending",
      icon: <FaHourglassHalf />,
      className: "pending",
    },
    accepted: {
      label: isArabic ? "تمت الموافقة" : "Accepted",
      icon: <FaCheckCircle />,
      className: "accepted",
    },
    rejected: {
      label: isArabic ? "مرفوض" : "Rejected",
      icon: <FaTimesCircle />,
      className: "rejected",
    },
    cancelled: {
      label: isArabic ? "ملغي" : "Cancelled",
      icon: <FaBan />,
      className: "cancelled",
    },
  };

  const formatDate = (value) => {
    if (!value) {
      return isArabic ? "غير محدد" : "Not specified";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString(isArabic ? "ar-EG" : "en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const handleCancel = (requestId) => {
    const confirmed = window.confirm(
      isArabic
        ? "هل أنت متأكد أنك تريد إلغاء طلب المعاينة؟"
        : "Are you sure you want to cancel this viewing request?"
    );

    if (!confirmed) return;

    const result = cancelViewingRequest(requestId);

    if (result.success) {
      setMessage(
        isArabic
          ? "تم إلغاء طلب المعاينة بنجاح."
          : "Viewing request cancelled successfully."
      );

      setRefresh((value) => value + 1);
    } else {
      setMessage(
        result.message ||
          (isArabic
            ? "تعذر إلغاء الطلب."
            : "Could not cancel the request.")
      );
    }
  };

  return (
    <main
      className="my-requests-page"
      dir={isArabic ? "rtl" : "ltr"}
    >
        <button
  type="button"
  className="my-requests-back-btn"
  onClick={() => navigate("/home")}
>
  <FaArrowRight />
  {isArabic ? "رجوع" : "Back"}
</button>
      <header className="my-requests-header">
        <div className="my-requests-icon">
          <FaCalendarAlt />
        </div>

        <div>
          <h1>
            {isArabic ? "طلباتي" : "My Requests"}
          </h1>

          <p>
            {isArabic
              ? "تابع مواعيد المعاينة وحالة كل طلب."
              : "Track your viewing appointments and request statuses."}
          </p>
        </div>
      </header>

      {message && (
        <div className="my-requests-message" role="status">
          <span>{message}</span>

          <button
            type="button"
            onClick={() => setMessage("")}
            aria-label={isArabic ? "إغلاق" : "Close"}
          >
            ×
          </button>
        </div>
      )}

      {requests.length === 0 ? (
        <section className="my-requests-empty">
          <FaInbox />

          <h2>
            {isArabic
              ? "لسه معندكش طلبات معاينة"
              : "No viewing requests yet"}
          </h2>

          <p>
            {isArabic
              ? "افتح تفاصيل أي عقار واطلب موعدًا لمعاينته، وهيظهر طلبك هنا."
              : "Open a property's details and request a viewing. Your requests will appear here."}
          </p>
        </section>
      ) : (
        <section className="my-requests-list" key={refresh}>
          {requests.map((request) => {
            const status =
              statusInfo[request.status] || statusInfo.pending;

            return (
              <article
                className="my-request-card"
                key={request.id}
              >
                <div className="my-request-top">
                  <h2>
                    {request.propertyTitle ||
                      (isArabic ? "عقار" : "Property")}
                  </h2>

                  <span
                    className={`my-request-status ${status.className}`}
                  >
                    {status.icon}
                    {status.label}
                  </span>
                </div>

                <div className="my-request-details">
                  <p>
                    <FaCalendarAlt />
                    <strong>
                      {isArabic ? "موعد المعاينة:" : "Appointment:"}
                    </strong>
                    {formatDate(request.appointment)}
                  </p>

                  {request.note && (
                    <p className="my-request-note">
                      <strong>
                        {isArabic ? "ملاحظاتك:" : "Your notes:"}
                      </strong>
                      {request.note}
                    </p>
                  )}
                </div>

                {request.status === "pending" && (
                  <button
                    type="button"
                    className="cancel-viewing-btn"
                    onClick={() => handleCancel(request.id)}
                  >
                    <FaBan />
                    {isArabic ? "إلغاء الطلب" : "Cancel request"}
                  </button>
                )}

                {request.status === "accepted" && (
                  <p className="my-request-result accepted">
                    <FaCheckCircle />
                    {isArabic
                      ? "المالك وافق على طلب المعاينة."
                      : "The owner accepted your request."}
                  </p>
                )}

                {request.status === "rejected" && (
                  <p className="my-request-result rejected">
                    <FaTimesCircle />
                    {isArabic
                      ? "المالك رفض طلب المعاينة."
                      : "The owner rejected your request."}
                  </p>
                )}

                {request.status === "cancelled" && (
                  <p className="my-request-result cancelled">
                    <FaBan />
                    {isArabic
                      ? "تم إلغاء هذا الطلب."
                      : "This request was cancelled."}
                  </p>
                )}
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}

export default MyRequests;
