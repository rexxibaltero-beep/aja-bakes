import Sidebar from "./sidebar";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="aja-page">

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


      {/* HOME CONTENT */}
      <main className="home-content">

        {/* LOGO / WELCOME */}
        <section className="hero-section">

          <img
            src="/logo.png"
            alt="AJA Bakes"
            className="aja-logo"
          />

          <h1>
            AJA BAKES
          </h1>

          <p className="home-tagline">
            Freshly Baked. Made with Love. 🤎
          </p>

        </section>


        {/* PRODUCT SELECTION */}
        <section className="home-products">

          <div className="section-heading">

            <span>❧</span>

            <h2>
              WHAT ARE YOU CRAVING?
            </h2>

            <span>❧</span>

          </div>


          <div className="category-grid">


            {/* =========================
                CINNAMON ROLLS
                ========================= */}

            <Link
              to="/products"
              className="home-category"
            >

              <div className="category-image">

                <img
                  src="/products/cinnamon_regular.png"
                  alt="Cinnamon Rolls"
                />

              </div>

              <div className="category-content">

                <h3>
                  CINNAMON ROLLS
                </h3>

                <p>
                  Soft, sweet and freshly baked.
                </p>

                <span>
                  VIEW MENU →
                </span>

              </div>

            </Link>


            {/* =========================
                GARLIC CHEESE BUN
                ========================= */}

            <Link
              to="/products"
              className="home-category"
            >

              <div className="category-image">

                <img
                  src="/products/garlicbun.png"
                  alt="Garlic Cheese Bun"
                />

              </div>

              <div className="category-content">

                <h3>
                  GARLIC CHEESE BUN
                </h3>

                <p>
                  Soft, cheesy and savory.
                </p>

                <span>
                  VIEW MENU →
                </span>

              </div>

            </Link>


            {/* =========================
                WAFFLES
                ========================= */}

            <Link
              to="/products"
              className="home-category"
            >

              <div className="category-image">

                <img
                  src="/products/waffles.png"
                  alt="Waffles"
                />

              </div>

              <div className="category-content">

                <h3>
                  WAFFLES
                </h3>

                <p>
                  Crispy, fluffy and delicious.
                </p>

                <span>
                  VIEW MENU →
                </span>

              </div>

            </Link>


          </div>

        </section>


        {/* SHORT ABOUT SECTION */}
      <section className="info-section">
{/* DECORATIVE DIVIDER */}
<div className="home-divider">
  <img
    src="/divider.jpg"
    alt=""
  />
</div>

  <div className="love-heading">
    <span>❧</span>

    <h2>
      Made With Love 🤎
    </h2>

    <span>❧</span>
  </div>

  <p className="love-description">
    Every AJA Bakes creation is freshly prepared
    with care and made with love.
  </p>

  <p className="love-subtext">
    From our oven to your table — every bite is made
    to make your day a little sweeter. ✨
  </p>

  {/* YOUR NEWS IMAGES HERE */}

<p>

</p>
  <div className="news-row">

    <div className="news-item">
      <img
        src="/waffles_news.jpg"
        alt="AJA Bakes Waffles"
      />
    </div>

    <div className="news-item">
      <img
        src="/garlicbun_news.jpg"
        alt="AJA Bakes Garlic Cheese Bun"
      />
    </div>

  </div>

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