import Sidebar from "./sidebar";
import "./About.css";

export default function About() {
  return (
    <div className="about-page">

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


      {/* ABOUT CONTENT */}
      <main className="about-content">

        {/* HERO */}
        <section className="about-hero">

          <img
            src="/logo.png"
            alt="AJA Bakes Logo"
            className="about-logo"
          />

          <h1>
            ABOUT AJA BAKES
          </h1>

          <p>
            Freshly Baked. Made With Love. 🤎
          </p>

        </section>


        {/* OUR STORY */}
        <section className="about-card">

          <h2>
            Our Story
          </h2>

          <div className="about-line"></div>

          <p>
            AJA Bakes was created with a simple idea —
            to make delicious baked treats that bring
            warmth and happiness to every bite.
          </p>

          <p>
            From soft cinnamon rolls to savory garlic
            cheese buns and delicious waffles, every
            creation is freshly prepared with care.
          </p>

        </section>


        {/* MADE WITH LOVE */}
        <section className="about-card love-card">

          <h2>
            Made With Love 🤎
          </h2>

          <div className="about-line"></div>

          <p>
            We believe that great food isn't just about
            the ingredients. It's about the time, care,
            and love put into making it.
          </p>

          <p>
            That's why every AJA Bakes creation is made
            with the intention of giving you something
            special to enjoy.
          </p>

        </section>


        {/* WHAT WE OFFER */}
        <section className="about-offers">

          <h2>
            What We Offer
          </h2>

          <div className="offer-grid">

            <div className="offer-card">

              <span>🍥</span>

              <h3>
                Cinnamon Rolls
              </h3>

              <p>
                Soft, sweet, and freshly baked favorites.
              </p>

            </div>


            <div className="offer-card">

              <span>🧄</span>

              <h3>
                Garlic Cheese Bun
              </h3>

              <p>
                Soft, savory, cheesy, and full of flavor.
              </p>

            </div>


            <div className="offer-card">

              <span>🧇</span>

              <h3>
                Waffles
              </h3>

              <p>
                Crispy on the outside and fluffy inside.
              </p>

            </div>

          </div>

        </section>


        {/* CLOSING */}
        <section className="about-closing">

          <h2>
            Thank You For Supporting AJA Bakes 🤎
          </h2>

          <p>
            Every order, every bite, and every bit of
            support means so much to us.
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