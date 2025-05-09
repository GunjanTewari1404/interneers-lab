import React, { useEffect, useState } from "react";
import { Product } from "../types/product";
import { apiService } from "../services/api";
import "../styles/Pages.css";

interface Category {
  id: string;
  title: string;
}

const RecentUpdates: React.FC = () => {
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          apiService.getRecentUpdates(),
          apiService.getCategories(),
        ]);
        setRecentProducts(productsData);
        const categoryMap: Record<string, string> = {};
        categoriesData.forEach((category: Category) => {
          categoryMap[category.id] = category.title;
        });

        setCategories(categoryMap);
        setError(null);
      } catch (err) {
        setError("Failed to fetch data. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="loading">Loading recent updates...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="page recent-updates-page">
      <h1 className="page-title">Recent Updates</h1>
      <div className="product-list">
        <div className="products-grid">
          {recentProducts.map((product) => (
            <div className="product-card" key={product.id}>
              <div className="product-header">
                <h3 className="product-name">{product.name}</h3>
                <span className="product-price">
                  ₹{Number(product.price).toFixed(2)}
                </span>
              </div>
              <div className="product-summary">
                <p className="product-short-desc">
                  {product.description.substring(0, 100)}
                  {product.description.length > 100 ? "..." : ""}
                </p>
                <div className="product-meta">
                  <span className="product-category">
                    {categories[product.category] || "Unknown Category"}
                  </span>
                  <span className="product-updated">
                    Updated: {new Date(product.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentUpdates;
