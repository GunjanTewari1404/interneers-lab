import { Product, ProductCategory, ProductHistory } from "../types/product";
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

export const apiService = {
  async getProducts(): Promise<Product[]> {
    const res = await fetch(`${API_URL}/products/`);
    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json();
  },

  async getProductById(productId: string): Promise<Product> {
    const res = await fetch(`${API_URL}/products/${productId}/`);
    if (!res.ok) throw new Error("Failed to fetch product details");
    return res.json();
  },

  async getRecentUpdates(): Promise<Product[]> {
    const res = await fetch(`${API_URL}/recent-updates/`);
    if (!res.ok) throw new Error("Failed to fetch recent updates");
    return res.json();
  },

  async getProductHistory(productId: string): Promise<ProductHistory[]> {
    const res = await fetch(`${API_URL}/product-history/${productId}/`);
    if (!res.ok)
      throw new Error(`Failed to fetch history for product ID: ${productId}`);
    return res.json();
  },

  async getCategories(): Promise<ProductCategory[]> {
    const res = await fetch(`${API_URL}/categories/`);
    if (!res.ok) throw new Error("Failed to fetch categories");
    return res.json();
  },

  async getCategoryById(categoryId: string): Promise<ProductCategory> {
    const res = await fetch(`${API_URL}/categories/id/${categoryId}/`);
    if (!res.ok)
      throw new Error(`Failed to fetch category with ID: ${categoryId}`);
    return res.json();
  },

  async getCategoryByTitle(title: string): Promise<ProductCategory> {
    const res = await fetch(`${API_URL}/categories/title/${title}/`);
    if (!res.ok) throw new Error("Failed to fetch category");
    return res.json();
  },

  async getCategoryProducts(categoryId: string): Promise<Product[]> {
    const res = await fetch(`${API_URL}/categories/${categoryId}/products/`);
    if (!res.ok) throw new Error("Failed to fetch category products");
    return res.json();
  },

  async getAllCategories(): Promise<ProductCategory[]> {
    return this.getCategories();
  },

  async updateProduct(
    productId: string,
    productData: Partial<Product>,
  ): Promise<Product> {
    const res = await fetch(`${API_URL}/products/${productId}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: productId,
        ...productData,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to update product");
    }

    return res.json();
  },

  async deleteProduct(productId: string): Promise<void> {
    const res = await fetch(`${API_URL}/products/${productId}/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: productId,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to delete product");
    }
  },

  async createProduct(productData: Partial<Product>): Promise<Product> {
    const res = await fetch(`${API_URL}/products/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productData),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to create product");
    }

    return res.json();
  },
  async updateProductCategory(
    productId: string,
    categoryId: string | null,
  ): Promise<void> {
    const res = await fetch(`${API_URL}/prod-categories/manage-products/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: productId,
        category_id: categoryId,
        action: categoryId ? "add" : "remove",
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to update product category");
    }
  },
};
