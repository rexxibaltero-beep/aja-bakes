import { useState } from "react";
import { Link } from "react-router-dom";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* =========================================
          HAMBURGER BUTTON
          ========================================= */}

      <button
        className="hamburger"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
      >
        ☰
      </button>


      {/* =========================================
          OVERLAY
          ========================================= */}

      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
        ></div>
      )}


      {/* =========================================
          SIDEBAR
          ========================================= */}

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>


        {/* CLOSE BUTTON */}

        <button
          className="close-btn"
          onClick={() => setIsOpen(false)}
          aria-label="Close menu"
        >
          ✕
        </button>


        {/* =========================================
            SIDEBAR BRAND
            ========================================= */}

        <div className="sidebar-brand">

          <img
            src="/logo.png"
            alt="AJA Bakes Logo"
            className="sidebar-logo"
          />

          <h2>
            AJA BAKES
          </h2>

          <p>
            Freshly Baked. Made with Love.
          </p>

        </div>


        {/* =========================================
            NAVIGATION
            ========================================= */}

        <nav className="sidebar-menu">


          {/* HOME */}

          <Link
            to="/"
            className="sidebar-btn"
            onClick={() => setIsOpen(false)}
          >
            <span>🏠</span>
            <span>Home</span>
          </Link>


          {/* OUR PRODUCTS */}

          <Link
            to="/products"
            className="sidebar-btn"
            onClick={() => setIsOpen(false)}
          >
            <span>🍥</span>
            <span>Our Products</span>
          </Link>


          {/* ORDER NOW */}

          <Link
          to="/orders"
          className="sidebar-btn"
          onClick={() => setIsOpen(false)}
        >
          <span>🛒</span>
          <span>Orders</span>
        </Link>


          {/* ABOUT AJA BAKES */}

          <Link
            to="/about"
            className="sidebar-btn"
            onClick={() => setIsOpen(false)}
          >
            <span>🤎</span>
            <span>About AJA Bakes</span>
          </Link> 


          {/* PICKUP & DELIVERY */}

          <Link
          to="/pickup-delivery"
          className="sidebar-btn"
          onClick={() => setIsOpen(false)}
        >
          <span>📍</span>
          <span>Pickup & Delivery</span>
        </Link>


          {/* CONTACT US */}

          <Link
            to="/contact"
            className="sidebar-btn"
            onClick={() => setIsOpen(false)}
          >
            <span>📞</span>
            <span>Contact Us</span>
          </Link>


        </nav>

      </aside>
    </>
  );
}
