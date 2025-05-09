import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Product,
  ProductHistory as ProductHistoryType,
  ProductCategory,
} from "../types/product";
import { apiService } from "../services/api";
import "../styles/ProductDetail.css";

interface EnhancedProduct extends Product {
  categoryTitle?: string;
}

interface ProductHistoryEntry extends ProductHistoryType {
  action?: string;
  user?: string;
}

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<EnhancedProduct | null>(null);
  const [productHistory, setProductHistory] = useState<ProductHistoryEntry[]>(
    [],
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isMovingCategory, setIsMovingCategory] = useState<boolean>(false);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [updateLoading, setUpdateLoading] = useState<boolean>(false);
  const [updateStockMode, setUpdateStockMode] = useState<boolean>(false);
  const [newStockValue, setNewStockValue] = useState<number>(0);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    description: string;
    price: number | null;
    brand: string;
  }>({
    name: "",
    description: "",
    price: null,
    brand: "",
  });

  const determineAction = (
    currentEntry: ProductHistoryEntry,
    previousEntry: ProductHistoryEntry | null,
  ): string => {
    if (!previousEntry) return "Created";

    const changes = [];

    if (currentEntry.price !== previousEntry.price) {
      changes.push("price updated");
    }
    if (currentEntry.quantity !== previousEntry.quantity) {
      changes.push("quantity updated");
    }
    if (currentEntry.name !== previousEntry.name) {
      changes.push("name updated");
    }
    if (currentEntry.description !== previousEntry.description) {
      changes.push("description updated");
    }
    if (currentEntry.category !== previousEntry.category) {
      changes.push("category changed");
    }
    if (currentEntry.brand !== previousEntry.brand) {
      changes.push("brand updated");
    }

    return changes.length > 0 ? changes.join(", ") : "Updated";
  };

  const fetchProductDetails = useCallback(async () => {
    if (!productId) return;

    try {
      setLoading(true);

      const [productData, historyData] = await Promise.all([
        apiService.getProductById(productId),
        apiService.getProductHistory(productId),
      ]);

      let categoryTitle = "Unknown Category";
      if (productData?.category) {
        try {
          const categoryData = await apiService.getCategoryById(
            productData.category,
          );
          categoryTitle = categoryData?.title || "Unknown Category";
        } catch (categoryErr) {
          console.error("Error fetching category:", categoryErr);
        }
      }

      let parsedPrice = null;
      if (productData.price !== undefined && productData.price !== null) {
        parsedPrice = parseFloat(String(productData.price));
      }

      const formattedProduct = {
        ...productData,
        price: !isNaN(parsedPrice as number) ? parsedPrice : null,
        categoryTitle,
      };
      const sortedHistory = [...historyData].sort((a, b) => {
        return (
          new Date(a.version_created_at).getTime() -
          new Date(b.version_created_at).getTime()
        );
      });

      const formattedHistory = sortedHistory.map((entry, index) => {
        const previousEntry = index > 0 ? sortedHistory[index - 1] : null;
        const action = determineAction(entry, previousEntry);

        return {
          ...entry,
          action,
          timestamp: entry.version_created_at,
        };
      });

      setProduct(formattedProduct);
      setProductHistory(formattedHistory.reverse());
      setError(null);
      setEditForm({
        name: formattedProduct.name,
        description: formattedProduct.description || "",
        price: formattedProduct.price,
        brand: formattedProduct.brand || "",
      });

      setNewStockValue(formattedProduct.quantity);
    } catch (err) {
      setError("Failed to load product details. Please try again later.");
      console.error("Error in fetchProductDetails:", err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  const fetchCategories = useCallback(async () => {
    try {
      const categoriesData = await apiService.getAllCategories();
      setCategories(categoriesData);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!productId) return;

      await fetchProductDetails();
      if (isMounted) {
        await fetchCategories();
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [productId, fetchProductDetails, fetchCategories]);

  useEffect(() => {
    if (isMovingCategory && product && product.category) {
      setSelectedCategoryId(product.category);
    }
  }, [isMovingCategory, product]);

  useEffect(() => {
    if (product && product.category) {
      setSelectedCategoryId(product.category);
    }
  }, [product]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    if (name === "price") {
      const numValue = value === "" ? null : parseFloat(value);
      setEditForm((prev) => ({
        ...prev,
        [name]: numValue,
      }));
    } else {
      setEditForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleUpdateStock = async () => {
    if (!productId || newStockValue < 0 || !product) {
      setUpdateError("Please enter a valid stock quantity");
      return;
    }

    setUpdateLoading(true);
    setUpdateError(null);
    setUpdateSuccess(null);

    try {
      await apiService.updateProduct(productId, {
        quantity: newStockValue,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        brand: product.brand,
      });
      setUpdateSuccess("Stock updated successfully");
      await fetchProductDetails();
      setUpdateStockMode(false);
    } catch (err) {
      setUpdateError("Failed to update stock. Please try again.");
      console.error("Error updating stock:", err);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!productId || !product) return;
    if (!editForm.name.trim()) {
      setUpdateError("Product name is required");
      return;
    }

    setUpdateLoading(true);
    setUpdateError(null);
    setUpdateSuccess(null);

    try {
      await apiService.updateProduct(productId, {
        name: editForm.name,
        description: editForm.description,
        price: editForm.price,
        brand: editForm.brand,
        category: product.category,
        quantity: product.quantity,
      });
      setUpdateSuccess("Product updated successfully");
      await fetchProductDetails();
      setIsEditing(false);
    } catch (err) {
      setUpdateError("Failed to update product. Please try again.");
      console.error("Error updating product:", err);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleMoveCategory = async () => {
    if (!productId || !product) {
      setUpdateError("Product not found");
      return;
    }
    if (!selectedCategoryId) {
      setUpdateError("Please select a category");
      return;
    }

    setUpdateLoading(true);
    setUpdateError(null);
    setUpdateSuccess(null);

    try {
      if (selectedCategoryId === "none") {
        await apiService.updateProductCategory(productId, null);
      } else {
        await apiService.updateProductCategory(productId, selectedCategoryId);
      }

      const message =
        selectedCategoryId === "none"
          ? "Product removed from category successfully"
          : "Product moved to new category successfully";

      setUpdateSuccess(message);
      await fetchProductDetails();
      setIsMovingCategory(false);
    } catch (err) {
      setUpdateError("Failed to update product category. Please try again.");
      console.error("Error updating product category:", err);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productId) return;

    if (
      !window.confirm(
        "Are you sure you want to delete this product? This action cannot be undone.",
      )
    ) {
      return;
    }

    setUpdateLoading(true);
    setUpdateError(null);

    try {
      await apiService.deleteProduct(productId);
      navigate("/products", {
        state: { message: "Product deleted successfully" },
      });
    } catch (err) {
      setUpdateError("Failed to delete product. Please try again.");
      console.error("Error deleting product:", err);
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading">Loading product details...</div>
      </div>
    );
  }

  if (error) return <div className="error-message">{error}</div>;
  if (!product) return <div className="error-message">Product not found.</div>;

  return (
    <div className="page product-detail-page">
      <div className="breadcrumb">
        <Link to="/products">Products</Link> &gt;
        <Link to={`/categories/id/${product.category}`}>
          {product.categoryTitle || "Category"}
        </Link>{" "}
        &gt;
        <span>{product.name}</span>
      </div>

      {updateSuccess && (
        <div className="success-notification">
          <span>{updateSuccess}</span>
          <button onClick={() => setUpdateSuccess(null)}>×</button>
        </div>
      )}

      {updateError && (
        <div className="error-notification">
          <span>{updateError}</span>
          <button onClick={() => setUpdateError(null)}>×</button>
        </div>
      )}

      {updateLoading && (
        <div className="update-loading-overlay">
          <div className="loading-spinner"></div>
          <div>Processing...</div>
        </div>
      )}

      <div className="product-detail-container">
        <div className="product-main">
          {isEditing ? (
            <div className="edit-product-form">
              <h1>Edit Product</h1>
              <div className="form-group">
                <label htmlFor="name">Product Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={editForm.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={editForm.description}
                  onChange={handleInputChange}
                  rows={5}
                />
              </div>

              <div className="form-group">
                <label htmlFor="price">Price (₹)</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={editForm.price === null ? "" : editForm.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="brand">Brand</label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={editForm.brand}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-actions">
                <button
                  className="action-button cancel"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
                <button
                  className="action-button primary"
                  onClick={handleSaveChanges}
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="product-title">{product.name}</h1>

              <div className="product-description-section">
                <h2>Description</h2>
                <p className="product-description">{product.description}</p>
              </div>

              <div className="product-extra-info">
                <h2>Additional Details</h2>
                <div className="info-item">
                  <span className="info-label">Brand :&nbsp;</span>
                  <span className="info-value">
                    {product.brand || "Not specified"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Created At :&nbsp;</span>
                  <span className="info-value">
                    {new Date(product.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="product-sidebar">
          {isMovingCategory ? (
            <div className="product-info-card">
              <h2>Move to Category</h2>
              <div className="form-group">
                <label htmlFor="category">Select Category</label>
                <select
                  id="category"
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="category-select"
                >
                  <option value="">-- Select a category --</option>
                  <option value="none">None (Remove from category)</option>
                  {categories.map((category) => (
                    <option
                      key={category.id || category.id}
                      value={category.id || category.id}
                      disabled={
                        (category.id || category.id) === product.category
                      }
                    >
                      {category.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-actions">
                <button
                  className="action-button cancel"
                  onClick={() => setIsMovingCategory(false)}
                >
                  Cancel
                </button>
                <button
                  className="action-button primary"
                  onClick={handleMoveCategory}
                  disabled={
                    !selectedCategoryId ||
                    (selectedCategoryId === product.category &&
                      selectedCategoryId !== "none")
                  }
                >
                  Move Product
                </button>
              </div>
            </div>
          ) : updateStockMode ? (
            <div className="product-info-card">
              <h2>Update Stock</h2>
              <div className="form-group">
                <label htmlFor="stock">New Stock Quantity</label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={newStockValue}
                  onChange={(e) =>
                    setNewStockValue(parseInt(e.target.value) || 0)
                  }
                  min="0"
                />
              </div>
              <div className="form-actions">
                <button
                  className="action-button cancel"
                  onClick={() => setUpdateStockMode(false)}
                >
                  Cancel
                </button>
                <button
                  className="action-button primary"
                  onClick={handleUpdateStock}
                >
                  Update Stock
                </button>
              </div>
            </div>
          ) : (
            <div className="product-info-card">
              <div className="product-price-section">
                <span className="product-price">
                  {product.price !== null && product.price !== undefined
                    ? `₹${product.price.toFixed(2)}`
                    : "Price: N/A"}
                </span>
              </div>

              <div className="product-info-section">
                <div className="info-item">
                  <span className="info-label">Category:</span>
                  <span className="info-value">
                    {product.categoryTitle || "Unknown Category"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Stock:</span>
                  <span
                    className={`info-value ${
                      product.quantity < 10 ? "low-stock" : ""
                    }`}
                  >
                    {product.quantity}{" "}
                    {product.quantity < 10 ? "(Low Stock)" : ""}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Last Updated:</span>
                  <span className="info-value">
                    {new Date(product.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="product-actions">
                <button
                  className="action-button primary"
                  onClick={() => setUpdateStockMode(true)}
                >
                  Update Stock
                </button>
                <button
                  className="action-button"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Product
                </button>
                <button
                  className="action-button"
                  onClick={() => setIsMovingCategory(true)}
                >
                  Move Category
                </button>
                <button
                  className="action-button delete"
                  onClick={handleDeleteProduct}
                >
                  Delete Product
                </button>
              </div>
            </div>
          )}

          <div className="product-history-card">
            <h2>History</h2>
            {productHistory.length > 0 ? (
              <ul className="history-list">
                {productHistory.map((entry, index) => (
                  <li key={index} className="history-item">
                    <span className="history-date">
                      {new Date(entry.version_created_at).toLocaleDateString()}
                    </span>
                    <span className="history-action">{entry.action}</span>
                    <span className="history-user">
                      {entry.user || "System"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-history">No history available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
