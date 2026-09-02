import { useState } from "react";
import Sidebar from "./sidebar";


/* =========================================
   CINNAMON ROLLS
   ========================================= */

const cinnamonRolls = [
  {
    name: "Classic",
    price: "₱55.00",
    image: "/products/cinnamon_regular.png",
  },
  {
    name: "Cheese",
    price: "₱60.00",
    image: "/products/cinnamon_cheese.png",
  },
  {
    name: "Oreo",
    price: "₱60.00",
    image: "/products/cinnamon_oreo.png",
  },
  {
    name: "Almond",
    price: "₱65.00",
    image: "/products/cinnamon_almond.png",
  },
  {
    name: "Biscoff",
    price: "₱70.00",
    image: "/products/cinnamon_biscoff.png",
  },
  {
    name: "Chocolate",
    price: "₱70.00",
    image: "/products/cinnamon_chocolate.png",
  },
];


/* =========================================
   GARLIC CHEESE BUN
   ========================================= */

const garlicBuns = [
  {
    name: "Garlic Cheese Bun",
    price: "₱60.00",
    image: "/products/garlicbun.png",
  },
];


/* =========================================
   WAFFLES
   ========================================= */

const waffles = [
  {
    name: "Ham Waffle",
    price: "₱10.00",
    image: "/products/waffles.png",
  },
  {
    name: "Cheese Waffle",
    price: "₱10.00",
    image: "/products/waffles.png",
  },
  {
    name: "Hotdog Waffle",
    price: "₱10.00",
    image: "/products/waffles.png",
  },
  {
    name: "Chocolate Waffle",
    price: "₱10.00",
    image: "/products/waffles.png",
  },
];


/* =========================================
   PRODUCT CARD
   ========================================= */

function ProductCard({ product }) {
  return (
    <div className="product-card">

      <div className="product-image-container">

        <img
          src={product.image}
          alt={product.name}
          className="product-image"
        />

      </div>


      <div className="product-info">

        <h3>
          {product.name}
        </h3>

        <p className="product-price">
          {product.price}
        </p>

        <button className="order-btn">
          ORDER NOW
        </button>

      </div>

    </div>
  );
}


/* =========================================
   PRODUCTS PAGE
   ========================================= */

export default function Products() {

  const [activeCategory, setActiveCategory] = useState("cinnamon");


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


      {/* PRODUCTS PAGE */}
      <main className="products-page">


        {/* PAGE HEADER */}
        <section className="products-header">

          <img
            src="/logo.png"
            alt="AJA Bakes"
            className="products-logo"
          />

          <h1>
            OUR PRODUCTS
          </h1>

          <p>
            Freshly baked favorites made with love. 🤎
          </p>

        </section>


        {/* CATEGORY TABS */}
        <div className="product-tabs">

          <button
            className={
              activeCategory === "cinnamon"
                ? "product-tab active"
                : "product-tab"
            }
            onClick={() => setActiveCategory("cinnamon")}
          >
            CINNAMON
          </button>


          <button
            className={
              activeCategory === "garlic"
                ? "product-tab active"
                : "product-tab"
            }
            onClick={() => setActiveCategory("garlic")}
          >
            GARLIC CHEESE BUN
          </button>


          <button
            className={
              activeCategory === "waffles"
                ? "product-tab active"
                : "product-tab"
            }
            onClick={() => setActiveCategory("waffles")}
          >
            WAFFLES
          </button>

        </div>


        {/* =========================
            CINNAMON
            ========================= */}

        {activeCategory === "cinnamon" && (

          <section className="product-category">

            <div className="category-title">

              <span>❧</span>

              <h2>
                CINNAMON ROLLS
              </h2>

              <span>❧</span>

            </div>


            <div className="product-grid">

              {cinnamonRolls.map((product) => (

                <ProductCard
                  key={product.name}
                  product={product}
                />

              ))}

            </div>

          </section>

        )}


        {/* =========================
            GARLIC CHEESE BUN
            ========================= */}

        {activeCategory === "garlic" && (

          <section className="product-category">

            <div className="category-title">

              <span>❧</span>

              <h2>
                GARLIC CHEESE BUN
              </h2>

              <span>❧</span>

            </div>


            <div className="product-grid">

              {garlicBuns.map((product) => (

                <ProductCard
                  key={product.name}
                  product={product}
                />

              ))}

            </div>

          </section>

        )}


        {/* =========================
            WAFFLES
            ========================= */}

        {activeCategory === "waffles" && (

          <section className="product-category">

            <div className="category-title">

              <span>❧</span>

              <h2>
                WAFFLES
              </h2>

              <span>❧</span>

            </div>


            <div className="product-grid">

              {waffles.map((product) => (

                <ProductCard
                  key={product.name}
                  product={product}
                />

              ))}

            </div>

          </section>

        )}


        {/* =========================
            COMING SOON
            ========================= */}

        <section className="coming-soon-section">

          <div className="category-title">

            <span>❧</span>

            <h2>
              COMING SOON
            </h2>

            <span>❧</span>

          </div>

          <p>
            More delicious treats are on the way. 🤎
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