import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import Sidebar from "./sidebar";
import { db } from "./firebase";
import "./Contact.css";

export default function Contact() {

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, subject, message } = formData;

    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      setSending(true);

      await addDoc(collection(db, "messages"), {
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
        status: "Unread",
        createdAt: serverTimestamp(),
      });

      alert("Your message has been sent successfully! 🤎");

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

    } catch (error) {
      console.error("Error sending message:", error);
      alert("Something went wrong while sending your message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="contact-page">

      {/* SIDEBAR */}
      <Sidebar />

      {/* NAVBAR */}
      <header className="navbar">

        <div className="nav-left">

          <img
            src="/logo.png"
            alt="AJA Bakes Logo"
            className="navbar-logo"
          />

          <span className="nav-title">
            AJA BAKES
          </span>

        </div>

      </header>

      {/* MAIN CONTENT */}
      <main className="contact-content">

        {/* HERO */}
        <section className="contact-hero">

          <div className="contact-icon">
            📞
          </div>

          <h1>
            CONTACT US
          </h1>

          <p>
            We'd love to hear from you! 🤎
          </p>

        </section>

        {/* CONTACT CARDS */}
        <section className="contact-options">

          {/* MESSAGE */}
          <div className="contact-card">

            <div className="contact-card-icon">
              💬
            </div>

            <h2>
              Send Us a Message
            </h2>

            <div className="contact-line"></div>

            <p>
              Have a question about our products,
              orders, or availability? Feel free to
              reach out to us.
            </p>

            <p>
              <b>
                bsentrep.davism@gmail.com
              </b>
            </p>

            <a
              href="mailto:bsentrep.davism@gmail.com"
              className="contact-button"
            >
              ✉️ Email Us
            </a>

          </div>

          {/* SOCIAL MEDIA */}
          <div className="contact-card">

            <div className="contact-card-icon">
              📱
            </div>

            <h2>
              Follow Us
            </h2>

            <div className="contact-line"></div>

            <p>
              Stay updated with our latest baked
              creations, announcements, and
              special offers.
            </p>

            <b>
              <p>AJA BAKES</p>
            </b>

            <a
              href="https://www.facebook.com/davis.michealla"
              className="contact-button"
            >
              🤎 Visit Our Page
            </a>

          </div>

        </section>

        {/* CONTACT INFORMATION */}
        <section className="contact-information">

          <h2>
            Get In Touch
          </h2>

          <p className="contact-subtitle">
            0905 658 2541
          </p>

          <div className="contact-info-grid">

            {/* LOCATION */}
            <div className="contact-info-item">

              <div className="info-icon">
                📍
              </div>

              <div>

                <h3>
                  Location
                </h3>

                <p>
                  Our pickup location will be provided
                  upon order confirmation.
                </p>

              </div>

            </div>

            {/* PHONE */}
            <div className="contact-info-item">

              <div className="info-icon">
                📞
              </div>

              <div>

                <h3>
                  Phone
                </h3>

                <p>
                  Contact us directly for inquiries
                  and orders.
                </p>

                <b>
                  <p>0905 658 2541</p>
                </b>

              </div>

            </div>

            {/* EMAIL */}
            <div className="contact-info-item">

              <div className="info-icon">
                ✉️
              </div>

              <div>

                <h3>
                  Email
                </h3>

                <p>
                  Send us a message anytime and
                  we'll get back to you.
                </p>

              </div>

            </div>

            {/* HOURS */}
            <div className="contact-info-item">

              <div className="info-icon">
                🕐
              </div>

              <div>

                <h3>
                  Business Hours
                </h3>

                <p>
                  Please message us for our current
                  availability and operating hours.
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* MESSAGE FORM */}
        <section className="contact-form-section">

          <h2>
            Send Us a Message 🤎
          </h2>

          <p>
            Have something you'd like to ask us?
            Fill out the form below.
          </p>

          <form
            className="contact-form"
            onSubmit={handleSubmit}
          >

            <div className="form-row">

              <div className="form-group">

                <label htmlFor="name">
                  Name
                </label>

                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                />

              </div>

              <div className="form-group">

                <label htmlFor="email">
                  Email
                </label>

                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Your email"
                  value={formData.email}
                  onChange={handleChange}
                />

              </div>

            </div>

            <div className="form-group">

              <label htmlFor="subject">
                Subject
              </label>

              <input
                type="text"
                id="subject"
                name="subject"
                placeholder="What would you like to ask?"
                value={formData.subject}
                onChange={handleChange}
              />

            </div>

            <div className="form-group">

              <label htmlFor="message">
                Message
              </label>

              <textarea
                id="message"
                name="message"
                rows="6"
                placeholder="Write your message here..."
                value={formData.message}
                onChange={handleChange}
              ></textarea>

            </div>

            <button
              type="submit"
              className="send-button"
              disabled={sending}
            >
              {sending
                ? "Sending..."
                : "🤎 Send Message"}
            </button>

          </form>

        </section>

        {/* CLOSING */}
        <section className="contact-closing">

          <h2>
            Thank You for Supporting AJA Bakes 🤎
          </h2>

          <p>
            Your support means the world to us.
            We can't wait to serve you something
            freshly baked!
          </p>

        </section>

      </main>

      {/* FOOTER */}
      <footer>

        <h3>
          AJA BAKES
        </h3>

        <p>
          Freshly Baked. Made with Love. 🤎
        </p>

        <p className="copyright">
          © 2026 AJA Bakes
        </p>

      </footer>

    </div>
  );
}