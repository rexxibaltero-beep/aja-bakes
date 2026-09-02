import Sidebar from "./sidebar";
import "./PickUpDelivery.css";

export default function PickUpDelivery() {
  return (
    <div className="pickup-page">

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
      <main className="pickup-content">

        {/* HERO */}
        <section className="pickup-hero">

          <div className="pickup-icon">
            📍
          </div>

          <h1>
            PICKUP & DELIVERY
          </h1>

          <p>
            Freshly baked treats, delivered with care. 🤎
          </p>

        </section>


        {/* PICKUP & DELIVERY OPTIONS */}
        <section className="pickup-options">

          {/* PICKUP */}
          <div className="pickup-card">

            <div className="pickup-card-icon">
              🛍️
            </div>

            <h2>
              Pick Up
            </h2>

            <div className="pickup-line"></div>

            <p>
              Prefer to pick up your order yourself?
              You can collect your freshly baked treats
              from our designated pickup location.
            </p>

            <div className="pickup-details">

              <div className="detail-item">
                <span>📍</span>
                <div>
                  <strong>Pickup Location</strong>
                  <p>
                    Please message us for the exact location.(Around Norzagaray and SJDM Bulacan only)
                  </p>
                </div>
              </div>

              <div className="detail-item">
                <span>🕐</span>
                <div>
                  <strong>Pickup Schedule</strong>
                  <p>
                    Pickup time will be confirmed when
                    your order is placed.
                  </p>
                </div>
              </div>

            </div>

          </div>


          {/* DELIVERY */}
          <div className="pickup-card">

            <div className="pickup-card-icon">
              🛵
            </div>

            <h2>
              Delivery
            </h2>

            <div className="pickup-line"></div>

            <p>
              Can't pick up your order? No worries!
              We can arrange delivery so your favorite
              AJA Bakes treats can come to you.
            </p>

            <div className="pickup-details">

              <div className="detail-item">
                <span>📍</span>
                <div>
                  <strong>Delivery Area</strong>
                  <p>
                    Delivery availability depends on
                    your location.(Around Norzagaray and SJDM Bulacan)
                  </p>
                </div>
              </div>

              <div className="detail-item">
                <span>💰</span>
                <div>
                  <strong>Delivery Fee</strong>
                  <p>
                    Delivery fee may vary depending
                    on the distance.
                  </p>
                </div>
              </div>

            </div>

          </div>

        </section>


        {/* HOW TO ORDER */}
        <section className="how-to-order">

          <h2>
            How to Order
          </h2>

          <p className="order-subtitle">
            Getting your AJA Bakes favorites is easy! 🤎
          </p>


          <div className="order-steps">

            <div className="order-step">

              <div className="step-number">
                1
              </div>

              <h3>
                Choose Your Treats
              </h3>

              <p>
                Browse our available products and
                choose what you'd like to order.
              </p>

            </div>


            <div className="order-step">

              <div className="step-number">
                2
              </div>

              <h3>
                Place Your Order
              </h3>

              <p>
                Send us your order details and preferred
                pickup or delivery option.
              </p>

            </div>


            <div className="order-step">

              <div className="step-number">
                3
              </div>

              <h3>
                Wait for Confirmation
              </h3>

              <p>
                We'll confirm your order, schedule,
                and total payment.
              </p>

            </div>


            <div className="order-step">

              <div className="step-number">
                4
              </div>

              <h3>
                Enjoy Your Treats
              </h3>

              <p>
                Pick up or receive your freshly baked
                AJA Bakes treats. 🤎
              </p>

            </div>

          </div>

        </section>


        {/* IMPORTANT NOTE */}
        <section className="pickup-note">

          <span className="note-icon">
            💡
          </span>

          <div>

            <h3>
              A Little Reminder
            </h3>

            <p>
              Please place your order in advance so we
              can prepare your treats fresh and make sure
              everything is ready for you.
            </p>

          </div>

        </section>


        {/* CTA */}
        <section className="pickup-cta">

          <h2>
            Ready to Order? 🤎
          </h2>

          <p>
            Choose your favorite treats and let us
            prepare something delicious for you.
          </p>

          <a
            href="/products"
            className="pickup-order-btn"
          >
            🛒 View Our Products
          </a>

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