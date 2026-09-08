import { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";

import { db } from "./firebase";
import "./Feedback.css";

export default function Feedback() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);

  /* =========================================
     LOAD MESSAGES
  ========================================= */

  const loadMessages = async () => {
    try {
      setLoading(true);

      const messagesQuery = query(
        collection(db, "messages"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(messagesQuery);

      const messageData = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setMessages(messageData);

    } catch (error) {
      console.error("Error loading messages:", error);

      // Fallback if ordering causes an issue
      try {
        const snapshot = await getDocs(
          collection(db, "messages")
        );

        const messageData = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setMessages(messageData);

      } catch (fallbackError) {
        console.error(
          "Fallback error:",
          fallbackError
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     INITIAL LOAD
  ========================================= */

  useEffect(() => {
    loadMessages();
  }, []);

  /* =========================================
     MARK AS READ
  ========================================= */

  const markAsRead = async (message) => {
    try {
      if (message.status === "Read") {
        setSelectedMessage(message);
        return;
      }

      await updateDoc(
        doc(db, "messages", message.id),
        {
          status: "Read",
        }
      );

      setMessages((currentMessages) =>
        currentMessages.map((item) =>
          item.id === message.id
            ? {
                ...item,
                status: "Read",
              }
            : item
        )
      );

      setSelectedMessage({
        ...message,
        status: "Read",
      });

    } catch (error) {
      console.error(
        "Error marking message as read:",
        error
      );

      alert("Unable to mark message as read.");
    }
  };

  /* =========================================
     DELETE MESSAGE
  ========================================= */

  const deleteMessage = async (messageId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this message?"
    );

    if (!confirmed) return;

    try {
      await deleteDoc(
        doc(db, "messages", messageId)
      );

      setMessages((currentMessages) =>
        currentMessages.filter(
          (message) => message.id !== messageId
        )
      );

      if (
        selectedMessage &&
        selectedMessage.id === messageId
      ) {
        setSelectedMessage(null);
      }

    } catch (error) {
      console.error(
        "Error deleting message:",
        error
      );

      alert("Unable to delete message.");
    }
  };

  /* =========================================
     DATE FORMAT
  ========================================= */

  const formatDate = (timestamp) => {
    if (!timestamp) return "No date";

    let date;

    if (
      timestamp &&
      typeof timestamp.toDate === "function"
    ) {
      date = timestamp.toDate();
    } else {
      date = new Date(timestamp);
    }

    if (isNaN(date.getTime())) {
      return "No date";
    }

    return date.toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";

    let date;

    if (
      timestamp &&
      typeof timestamp.toDate === "function"
    ) {
      date = timestamp.toDate();
    } else {
      date = new Date(timestamp);
    }

    if (isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleTimeString("en-PH", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  /* =========================================
     COUNTS
  ========================================= */

  const unreadCount = messages.filter(
    (message) => message.status !== "Read"
  ).length;

  /* =========================================
     LOADING
  ========================================= */

  if (loading) {
    return (
      <section className="feedback-page">

        <div className="feedback-loading">

          <div className="feedback-loading-icon">
            💬
          </div>

          <h2>
            Loading Messages...
          </h2>

          <p>
            Checking your customer messages.
          </p>

        </div>

      </section>
    );
  }

  return (
    <section className="feedback-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <header className="admin-header feedback-header">

        <div>

          <span className="header-eyebrow">
            CUSTOMER COMMUNICATION
          </span>

          <h1>
            Messages
          </h1>

          <p>
            View messages and inquiries sent
            through your Contact Us page.
          </p>

        </div>

        <button
          className="refresh-btn"
          onClick={loadMessages}
        >
          ↻ Refresh
        </button>

      </header>


      {/* =====================================
          SUMMARY
      ===================================== */}

      <section className="feedback-summary">

        <div className="feedback-stat">

          <span className="feedback-stat-icon">
            💬
          </span>

          <div>

            <small>
              Total Messages
            </small>

            <strong>
              {messages.length}
            </strong>

          </div>

        </div>


        <div className="feedback-stat unread">

          <span className="feedback-stat-icon">
            🔴
          </span>

          <div>

            <small>
              Unread
            </small>

            <strong>
              {unreadCount}
            </strong>

          </div>

        </div>


        <div className="feedback-stat read">

          <span className="feedback-stat-icon">
            ✓
          </span>

          <div>

            <small>
              Read
            </small>

            <strong>
              {messages.length - unreadCount}
            </strong>

          </div>

        </div>

      </section>


      {/* =====================================
          MESSAGES
      ===================================== */}

      <section className="feedback-card">

        <div className="feedback-card-header">

          <div>

            <span className="section-eyebrow">
              INBOX
            </span>

            <h2>
              Customer Messages
            </h2>

          </div>

          <span className="feedback-count">
            {messages.length}
          </span>

        </div>


        {messages.length === 0 ? (

          <div className="feedback-empty">

            <div className="feedback-empty-icon">
              🥐
            </div>

            <h3>
              No messages yet
            </h3>

            <p>
              Messages submitted through the
              Contact Us page will appear here.
            </p>

          </div>

        ) : (

          <div className="feedback-list">

            {messages.map((message) => (

              <div
                className={`feedback-message ${
                  message.status !== "Read"
                    ? "unread"
                    : ""
                }`}
                key={message.id}
              >

                {/* AVATAR */}

                <div className="feedback-avatar">

                  {(message.name || "C")
                    .charAt(0)
                    .toUpperCase()}

                </div>


                {/* MESSAGE INFO */}

                <div className="feedback-message-main">

                  <div className="feedback-message-top">

                    <div>

                      <h3>
                        {message.name ||
                          "Customer"}
                      </h3>

                      <span className="feedback-email">
                        {message.email ||
                          "No email"}
                      </span>

                    </div>

                    {message.status !==
                      "Read" && (
                      <span className="unread-badge">
                        UNREAD
                      </span>
                    )}

                  </div>


                  <strong className="feedback-subject">
                    {message.subject ||
                      "No subject"}
                  </strong>

                  <p className="feedback-preview">
                    {message.message}
                  </p>


                  <div className="feedback-message-bottom">

                    <span>
                      📅{" "}
                      {formatDate(
                        message.createdAt
                      )}
                    </span>

                    <span>
                      🕐{" "}
                      {formatTime(
                        message.createdAt
                      )}
                    </span>

                  </div>

                </div>


                {/* ACTIONS */}

                <div className="feedback-actions">

                  <button
                    className="feedback-view-btn"
                    onClick={() =>
                      markAsRead(message)
                    }
                  >
                    View
                  </button>

                  <button
                    className="feedback-delete-btn"
                    onClick={() =>
                      deleteMessage(
                        message.id
                      )
                    }
                  >
                    Delete
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </section>


      {/* =====================================
          MESSAGE MODAL
      ===================================== */}

      {selectedMessage && (

        <div
          className="feedback-modal-overlay"
          onClick={() =>
            setSelectedMessage(null)
          }
        >

          <div
            className="feedback-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="feedback-modal-close"
              onClick={() =>
                setSelectedMessage(null)
              }
            >
              ✕
            </button>


            <span className="section-eyebrow">
              CUSTOMER MESSAGE
            </span>

            <h2>
              {selectedMessage.subject ||
                "No Subject"}
            </h2>


            <div className="feedback-modal-person">

              <div className="feedback-avatar">
                {(selectedMessage.name ||
                  "C")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>

                <strong>
                  {selectedMessage.name ||
                    "Customer"}
                </strong>

                <a
                  href={`mailto:${selectedMessage.email}`}
                >
                  {selectedMessage.email}
                </a>

              </div>

            </div>


            <div className="feedback-modal-date">

              📅{" "}
              {formatDate(
                selectedMessage.createdAt
              )}

              {" • "}

              🕐{" "}
              {formatTime(
                selectedMessage.createdAt
              )}

            </div>


            <div className="feedback-modal-message">

              <p>
                {selectedMessage.message}
              </p>

            </div>


            <div className="feedback-modal-actions">

              <a
                href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(
                  selectedMessage.subject ||
                    "Your Message"
                )}`}
                className="feedback-reply-btn"
              >
                ✉️ Reply by Email
              </a>

              <button
                className="feedback-modal-delete"
                onClick={() =>
                  deleteMessage(
                    selectedMessage.id
                  )
                }
              >
                🗑 Delete
              </button>

            </div>

          </div>

        </div>

      )}

    </section>
  );
}