import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./Home";
import Products from "./Products";
import About from "./About";
import PickUpDelivery from "./PickUpDelivery";
import Contact from "./Contact";
import Admin from "./Admin";
import AdminLogin from "./AdminLogin";

import Orders from "./Orders";
import Checkout from "./Checkout";

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

        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<Admin />} />

        <Route path="/orders" element={<Orders />} />

        <Route
          path="/checkout"
          element={<Checkout />}
        />

      </Routes>

    </BrowserRouter>
  );
}