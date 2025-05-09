import React from "react";
import { Link } from "react-router-dom";
import { Product as ProductType } from "../types/product";
import "../styles/Product.css";

interface EnhancedProductType extends ProductType {
  categoryTitle?: string;
}

interface ProductProps {
  product: EnhancedProductType;
  isExpanded?: boolean;
  toggleExpand?: () => void;
}

const Product: React.FC<ProductProps> = ({
  product,
  isExpanded = false,
  toggleExpand,
}) => {
  const formattedPrice =
    product.price !== null && product.price !== undefined
      ? `₹${product.price.toFixed(2)}`
      : "N/A";

  return (
    <div
      className={`product-card ${isExpanded ? "expanded" : ""}`}
      onClick={toggleExpand}
    >
      <div className="product-header">
        <h3 className="product-name">{product.name}</h3>
        {!isExpanded && <span className="product-price">{formattedPrice}</span>}
      </div>

      {isExpanded ? (
        <div className="product-details">
          <div className="product-info">
            <p className="product-description">{product.description}</p>
            <div className="product-metadata">
              <p>
                <strong>Price:</strong>
                {formattedPrice}
              </p>
              <p>
                <strong>Category:</strong> {product.categoryTitle}
              </p>
              <p>
                <strong>In Stock:</strong> {product.quantity}
              </p>
              <p>
                <strong>Last Updated:</strong>{" "}
                {new Date(product.updated_at).toLocaleDateString()}
              </p>
            </div>
            <Link to={`/products/${product.id}`} className="view-details-btn">
              View Full Details{" "}
            </Link>
          </div>
        </div>
      ) : (
        <div className="product-summary">
          <p className="product-short-desc">
            {product.description.substring(0, 100)}...
          </p>
          <span className="product-stock">Stock: {product.quantity}</span>
        </div>
      )}
    </div>
  );
};

export default Product;
