import React from "react";
import { Link } from "react-router-dom";
import Navigation from "./Navigation";
import "../styles/Header.css";

const Header: React.FC = () => {
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="logo-container">
          <Link to="/">
            <span className="app-title">Inventory System</span>
          </Link>
        </div>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search products..."
            className="search-input"
          />
          <button className="search-button">
            <i className="search-icon">🔍</i>
          </button>
        </div>
        <div className="header-actions">
          <button className="action-button">
            <i className="notification-icon">🔔</i>
          </button>
          <button className="action-button">
            <i className="settings-icon">⚙️</i>
          </button>
          <div className="user-profile">
            <span className="user-name">Admin</span>
            <div className="user-avatar">👤</div>
          </div>
        </div>
      </div>
      <Navigation />
    </header>
  );
};

export default Header;
