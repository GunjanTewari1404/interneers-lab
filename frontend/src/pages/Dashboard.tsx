import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Product, ProductCategory } from "../types/product";
import { apiService } from "../services/api";
import "../styles/Dashboard.css";

interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalStock: number;
  updatesToday: number;
}

const Dashboard: React.FC = () => {
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCategories: 0,
    totalStock: 0,
    updatesToday: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [recentData, categoriesData, productsData] = await Promise.all([
          apiService.getRecentUpdates(),
          apiService.getCategories(),
          apiService.getProducts(),
        ]);

        setRecentProducts(recentData.slice(0, 5));
        setCategories(categoriesData);

        const catMap: Record<string, string> = {};
        categoriesData.forEach((category: ProductCategory) => {
          catMap[category.id] = category.title;
        });
        setCategoryMap(catMap);

        const totalQuantity = productsData.reduce(
          (sum, product) => sum + (product.quantity || 0),
          0,
        );

        // Update dashboard stats with dynamic data
        setDashboardStats({
          totalProducts: productsData.length,
          totalCategories: categoriesData.length,
          totalStock: totalQuantity,
          updatesToday: recentData.length,
        });

        setError(null);
      } catch (err) {
        setError("Failed to load dashboard data. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard</h1>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h3>Total Products</h3>
            <p className="stat-value">{dashboardStats.totalProducts}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏷️</div>
          <div className="stat-info">
            <h3>Categories</h3>
            <p className="stat-value">{dashboardStats.totalCategories}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>Total Stock</h3>
            <p className="stat-value">{dashboardStats.totalStock}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔄</div>
          <div className="stat-info">
            <h3>Updates</h3>
            <p className="stat-value">{dashboardStats.updatesToday}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-widgets">
        <div className="widget">
          <div className="widget-header">
            <h2>Recent Updates</h2>
            <Link to="/recent" className="widget-link">
              View All
            </Link>
          </div>
          <div className="widget-content">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Stock</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {recentProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <Link to={`/products/${product.id}/`}>
                        {product.name}
                      </Link>
                    </td>
                    <td>
                      {categoryMap[product.category] || "Unknown Category"}
                    </td>
                    <td>{product.quantity}</td>
                    <td>{new Date(product.updated_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="widget">
          <div className="widget-header">
            <h2>Categories</h2>
            <Link to="/products" className="widget-link">
              View Products
            </Link>
          </div>
          <div className="widget-content categories-grid">
            {categories.slice(0, 6).map((category) => (
              <Link
                to={`/categories/id/${category.id}`}
                className="category-card"
                key={category.id}
              >
                <h3>{category.title}</h3>
                <p>{category.description.substring(0, 60)}...</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
