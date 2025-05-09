import React from "react";
import ProductList from "../components/ProductList";
import "../styles/Pages.css";

const ProductListPage: React.FC = () => {
  return (
    <div className="page product-list-page">
      <h1 className="page-title">All Products</h1>
      <ProductList />
    </div>
  );
};
export default ProductListPage;
