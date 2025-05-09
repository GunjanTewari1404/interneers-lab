import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { ProductCategory } from "../types/product";
import { apiService } from "../services/api";
import "../styles/Navigation.css";

const Navigation: React.FC = () => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await apiService.getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <nav className="main-navigation">
      <div className="nav-container">
        <ul className="nav-menu">
          <li className="nav-item">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Dashboard
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/products"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              All Products
            </NavLink>
          </li>
          <li className="nav-item nav-dropdown">
            <span className="nav-link">Categories</span>
            <div className="dropdown-content">
              {loading ? (
                <span className="loading-text">Loading...</span>
              ) : (
                categories.map((category) => (
                  <NavLink
                    key={category.id}
                    to={`/categories/${category.id}`}
                    className="dropdown-item"
                  >
                    {category.title}
                  </NavLink>
                ))
              )}
            </div>
          </li>
          <li className="nav-item">
            <NavLink
              to="/recent-updates"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Recent Updates
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
