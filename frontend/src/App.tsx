import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Header from "components/Header";
import Dashboard from "pages/Dashboard";
import ProductListPage from "pages/ProductListPage";
import CategoryProducts from "pages/CategoryProducts";
import RecentUpdates from "pages/RecentUpdates";
import ProductDetail from "pages/ProductDetail";
import "./App.css";

const CategoryRedirect: React.FC = () => {
  const location = useLocation();
  const categoryId = location.pathname.split("/")[2];
  return <Navigate to={`/categories/id/${categoryId}`} replace />;
};

const App: React.FC = () => {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/:productId" element={<ProductDetail />} />
          <Route
            path="/categories/id/:categoryId"
            element={<CategoryProducts />}
          />
          <Route
            path="/categories/:categoryId/products"
            element={<CategoryProducts />}
          />
          <Route
            path="/categories/:categoryId"
            element={<CategoryRedirect />}
          />
          <Route path="/recent" element={<RecentUpdates />} />
          <Route path="/recent-updates" element={<RecentUpdates />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="app-footer">
        <div className="footer-content">
          <p>
            &copy; {new Date().getFullYear()} Inventory System. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
