import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./Home";
import Products from "./Products";
import About from "./About";
import PickUpDelivery from "./PickUpDelivery";
import Contact from "./Contact";

export default function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/products"
          element={<Products />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/pickup-delivery"
          element={<PickUpDelivery />}
        />

        <Route
        path="/contact"
        element={<Contact />}
      />

      </Routes>

    </BrowserRouter>
  );
}