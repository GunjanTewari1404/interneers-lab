import { useParams } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { ProductCategory } from "../types/product";
import ProductList from "../components/ProductList";
import { apiService } from "../services/api";
import "../styles/Pages.css";

const CategoryProducts: React.FC = () => {
  const [category, setCategory] = useState<ProductCategory | null>(null);
  const { categoryId } = useParams<{ categoryId: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategory = async () => {
      if (!categoryId) return;

      try {
        setLoading(true);
        const categoryData = await apiService.getCategoryById(categoryId);
        setCategory(categoryData);
        setError(null);
      } catch (err) {
        setError("Failed to load category details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [categoryId]);

  if (loading && !category)
    return <div className="loading">Loading category...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!category && !loading)
    return <div className="error-message">Category not found.</div>;

  return (
    <div className="page category-products-page">
      <div className="category-header">
        <h1 className="page-title">{category?.title}</h1>
        <p className="category-description">{category?.description}</p>
      </div>
      <ProductList categoryId={categoryId} />
    </div>
  );
};
export default CategoryProducts;
