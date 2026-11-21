
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaCheck,
  FaTimes,
  FaClock,
  FaMapMarkerAlt,
  FaInbox,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";
import { useProperties } from "../../context/PropertyContext";
import { useLanguage } from "../../context/LanguageContext";
import "./OwnerViewingRequests.css";

function OwnerViewingRequests() {
  const {
    getOwnerViewingRequests,
    updateViewingRequestStatus,
    completeViewingRequest,
  } = useProperties();

  const { language } = useLanguage();
  const isArabic = language === "ar";
  const navigate = useNavigate();

  // يرجع للصفحة السابقة (مثلاً الإشعارات)، ولو الصفحة اتفتحت مباشرة يرجع للرئيسية
  const goBack = () => {
    if (window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate("/home");
    }
  };

  const [refresh, setRefresh] = useState(0);
  const [message, setMessage] = useState("");

  const requests = getOwnerViewingRequests();

  const handleStatusChange = async (requestId, status) => {
    const result = await updateViewingRequestStatus(requestId, status);

    setMessage(
      result.success
        ? isArabic
          ? status === "accepted"
            ? "تم قبول طلب المعاينة بنجاح."
            : "تم رفض طلب المعاينة."
          : status === "accepted"
            ? "Viewing request accepted successfully."
            : "Viewing request rejected."
        : result.message ||
            (isArabic
              ? "تعذر تحديث الطلب."
              : "Could not update the request.")
    );

    if (result.success) {
      setRefresh((value) => value + 1);
    }
  };

  // قفل الطلب بعد إتمام المعاينة
  const handleComplete = async (requestId) => {
    const confirmed = window.confirm(
      isArabic
        ? "هل تمت المعاينة؟ سيتم إغلاق هذا الطلب."
        : "Was the viewing completed? This request will be closed."
    );

    if (!confirmed) return;

    const result = await completeViewingRequest(requestId);

    setMessage(
      result.success
        ? isArabic
          ? "تم إغلاق طلب المعاينة."
          : "Viewing request closed."
        : result.message ||
            (isArabic
              ? "تعذر إغلاق الطلب."
              : "Could not close the request.")
    );
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return isArabic ? "غير محدد" : "Not specified";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return dateValue;

    return date.toLocaleString(isArabic ? "ar-EG" : "en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getStatus = (status) => {
    const statuses = {
      pending: isArabic ? "قيد الانتظار" : "Pending",
      accepted: isArabic ? "تمت الموافقة" : "Accepted",
      rejected: isArabic ? "مرفوض" : "Rejected",
      cancelled: isArabic ? "ملغي" : "Cancelled",
      completed: isArabic ? "تمت المعاينة" : "Completed",
    };

    return statuses[status] || status;
  };

  const getStatusClass = (status) => {
    return `viewing-status viewing-status-${status}`;
  };

  return (
    <main
      className="owner-viewing-page"
      dir={isArabic ? "rtl" : "ltr"}
      key={refresh}
    >
      <button type="button" className="viewing-back-btn" onClick={goBack}>
        {isArabic ? <FaArrowRight /> : <FaArrowLeft />}
        {isArabic ? "رجوع" : "Back"}
      </button>

      <header className="viewing-page-header">
        <div className="viewing-header-icon">
          <FaCalendarAlt />
        </div>

        <div>
          <h1>
            {isArabic ? "طلبات المعاينة" : "Viewing Requests"}
          </h1>

          <p>
            {isArabic
              ? "تابع طلبات المستأجرين وحدد موقفك من كل طلب."
              : "Review tenant requests and respond to each one."}
          </p>
        </div>
      </header>

      {message && (
        <div className="viewing-feedback" role="status">
          {message}
          <button
            type="button"
            onClick={() => setMessage("")}
            aria-label={isArabic ? "إغلاق الرسالة" : "Dismiss message"}
          >
            <FaTimes />
          </button>
        </div>
      )}

      {requests.length === 0 ? (
        <section className="viewing-empty">
          <FaInbox className="viewing-empty-icon" />

          <h2>
            {isArabic ? "لا توجد طلبات حتى الآن" : "No requests yet"}
          </h2>

          <p>
            {isArabic
              ? "عندما يطلب مستأجر معاينة أحد عقاراتك، سيظهر الطلب هنا."
              : "Tenant viewing requests for your properties will appear here."}
          </p>
        </section>
      ) : (
        <section className="viewing-request-list">
          {requests.map((request) => (
            <article
              className="viewing-request-card"
              key={request.id}
            >
              <div className="viewing-card-top">
                <h2>{request.propertyTitle || (isArabic ? "عقار" : "Property")}</h2>

                <span className={getStatusClass(request.status)}>
                  {getStatus(request.status)}
                </span>
              </div>

              <div className="viewing-request-info">
                <p>
                  <FaInbox />
                  <strong>
                    {isArabic ? "اسم المستأجر:" : "Tenant:"}
                  </strong>
                  {" "}
                  {request.tenantName || (isArabic ? "غير معروف" : "Unknown")}
                </p>

                <p>
                  <FaCalendarAlt />
                  <strong>
                    {isArabic ? "موعد المعاينة:" : "Appointment:"}
                  </strong>
                  {" "}
                  {formatDate(request.appointment)}
                </p>

                {request.note && (
                  <p className="viewing-request-note">
                    <FaMapMarkerAlt />
                    <strong>
                      {isArabic ? "ملاحظات:" : "Notes:"}
                    </strong>
                    {" "}
                    {request.note}
                  </p>
                )}
              </div>

              {request.status === "pending" && (
                <div className="viewing-request-actions">
                  <button
                    type="button"
                    className="viewing-accept-btn"
                    onClick={() =>
                      handleStatusChange(request.id, "accepted")
                    }
                  >
                    <FaCheck />
                    {isArabic ? "قبول الطلب" : "Accept"}
                  </button>

                  <button
                    type="button"
                    className="viewing-reject-btn"
                    onClick={() =>
                      handleStatusChange(request.id, "rejected")
                    }
                  >
                    <FaTimes />
                    {isArabic ? "رفض الطلب" : "Reject"}
                  </button>
                </div>
              )}

              {request.status === "accepted" && (
                <>
                  <p className="viewing-result-message accepted-message">
                    <FaCheck />
                    {isArabic
                      ? "تمت الموافقة على هذا الطلب."
                      : "This request has been accepted."}
                  </p>

                  <div className="viewing-request-actions">
                    <button
                      type="button"
                      className="viewing-complete-btn"
                      onClick={() => handleComplete(request.id)}
                    >
                      <FaCheck />
                      {isArabic
                        ? "تمت المعاينة (إغلاق الطلب)"
                        : "Viewing done (close request)"}
                    </button>
                  </div>
                </>
              )}

              {request.status === "completed" && (
                <p className="viewing-result-message completed-message">
                  <FaCheck />
                  {isArabic
                    ? "تمت المعاينة وتم إغلاق هذا الطلب."
                    : "The viewing is done and this request is closed."}
                </p>
              )}

              {request.status === "rejected" && (
                <p className="viewing-result-message rejected-message">
                  <FaTimes />
                  {isArabic
                    ? "تم رفض هذا الطلب."
                    : "This request has been rejected."}
                </p>
              )}
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

export default OwnerViewingRequests;
