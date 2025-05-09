import React, { useState, useEffect } from "react";
import Product from "./Product";
import { apiService } from "../services/api";
import "../styles/ProductList.css";
import { Product as ProductType } from "../types/product";

interface EnhancedProductType extends ProductType {
  categoryTitle?: string;
}

interface ProductListProps {
  categoryId?: string;
}

const ProductList: React.FC<ProductListProps> = ({ categoryId }) => {
  const [products, setProducts] = useState<EnhancedProductType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let productsData: ProductType[];

        if (categoryId) {
          productsData = await apiService.getCategoryProducts(categoryId);
        } else {
          productsData = await apiService.getProducts();
        }

        const enhancedProducts = await Promise.all(
          productsData.map(async (product: ProductType) => {
            let categoryTitle = "Unknown Category";

            if (product.category) {
              try {
                const categoryData = await apiService.getCategoryById(
                  product.category,
                );
                categoryTitle = categoryData?.title || "Unknown Category";
              } catch (categoryErr) {
                console.error(
                  `Error fetching category for product ${product.id}:`,
                  categoryErr,
                );
              }
            }

            let parsedPrice = null;
            if (product.price !== undefined && product.price !== null) {
              parsedPrice = parseFloat(String(product.price));
            }
            return {
              ...product,
              price: !isNaN(parsedPrice as number) ? parsedPrice : null,
              categoryTitle,
            };
          }),
        );

        setProducts(enhancedProducts);
        setError(null);
      } catch (err) {
        setError("Failed to fetch products. Please try again later.");
        console.error("Error in fetchProducts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId]);

  const toggleProductExpand = (productId: string) => {
    setExpandedProductId(expandedProductId === productId ? null : productId);
  };

  if (loading) return <div className="loading">Loading products...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (products.length === 0)
    return <div className="no-products">No products found.</div>;

  return (
    <div className="product-list">
      <h2 className="product-list-title">
        {categoryId ? "Category Products" : "All Products"}
      </h2>
      <div className="products-grid">
        {products.map((product) => (
          <Product
            key={product.id}
            product={product}
            isExpanded={expandedProductId === product.id}
            toggleExpand={() => toggleProductExpand(product.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductList;
