export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number | null;
  brand: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface EnhancedProduct extends Product {
  categoryTitle?: string;
}

export interface ProductHistory {
  id: string;
  product_id: string;
  name: string;
  description: string;
  category: string;
  price: number | null;
  brand: string;
  quantity: number;
  updated_at: string;
  version_created_at: string;
}

export interface ProductCategory {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}
