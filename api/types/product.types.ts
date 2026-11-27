export interface Brand {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface CatalogueCategory extends Category {
  slug: string;
}

export interface ProductDetailCategory extends CatalogueCategory {
  parent_id: string | null;
}

export interface ProductImage {
  id: string;
  by_name: string;
  by_url: string;
  source_name: string;
  source_url: string;
  file_name: string;
  title: string;
}

export interface ProductSpecification {
  id: string;
  product_id: string;
  spec_name: string;
  spec_value: string;
  spec_unit: string | null;
}

export interface BaseProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  is_location_offer: boolean;
  is_rental: boolean;
  in_stock: boolean;
  product_image: ProductImage;
  category: Category;
  brand: Brand;
}

export interface SearchProduct extends BaseProduct {
  co2_rating: string;
  is_eco_friendly: boolean;
}

export interface Product extends SearchProduct {
  category: CatalogueCategory;
}

export interface ProductDetail extends Product {
  category: ProductDetailCategory;
  specs: ProductSpecification[];
}

export type RelatedProduct = BaseProduct;

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

export interface ApiErrorResponse {
  message: string;
}

export interface ProductQueryParams {
  by_brand?: string;
  by_category?: string;
  is_rental?: string;
  between?: string;
  sort?: string;
  page?: number;
}