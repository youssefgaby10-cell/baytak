import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaQuestionCircle,
  FaChevronDown,
} from "react-icons/fa";

import { useLanguage } from "../../context/LanguageContext.jsx";
import "../../styles/Help.css";

function Help() {
  const { t } = useLanguage();

  const navigate = useNavigate();

  const [openQuestion, setOpenQuestion] = useState(null);

  const questions = [
    {
      question: t.faqSearchPropertyQ,
      answer:
        t.faqSearchPropertyA,
    },
    {
      question: t.faqAddFavoriteQ,
      answer:
        t.faqAddFavoriteA,
    },
    {
      question: t.faqEditAccountQ,
      answer:
        t.faqEditAccountA,
    },
    {
      question: t.faqForgotPasswordQ,
      answer:
        t.faqForgotPasswordA,
    },
    {
      question: t.faqChangeContactQ,
      answer:
        t.faqChangeContactA,
    },
    {
      question: t.faqContactSupportQ,
      answer:
        t.faqContactSupportA,
    },
  ];

  const toggleQuestion = (index) => {
    setOpenQuestion(
      openQuestion === index ? null : index
    );
  };

  return (
    <div className="help-page">

      {/* Header */}
      <div className="help-header">

        <button
          className="help-back-btn"
          onClick={() => navigate(-1)}
        >
          <FaArrowRight />
        </button>

        <h1>{t.help}</h1>

        <FaQuestionCircle className="help-header-icon" />

      </div>

      {/* Intro */}
      <div className="help-intro">

        <div className="help-main-icon">
          <FaQuestionCircle />
        </div>

        <h2>{t.howCanWeHelpIntro}</h2>

        <p>
          {t.helpIntroDescription}
        </p>

      </div>

      {/* FAQ */}
      <section className="help-section">

        <h2>{t.frequentlyAskedQuestions}</h2>

        <div className="faq-list">

          {questions.map((item, index) => (

            <div
              className={`faq-item ${
                openQuestion === index ? "open" : ""
              }`}
              key={index}
            >

              <button
                className="faq-question"
                onClick={() => toggleQuestion(index)}
              >

                <span>{item.question}</span>

                <FaChevronDown />

              </button>

              {openQuestion === index && (

                <div className="faq-answer">
                  {item.answer}
                </div>

              )}

            </div>

          ))}

        </div>

      </section>

    </div>
  );
}

export default Help;