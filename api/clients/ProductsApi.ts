import type {
  APIRequestContext,
  APIResponse,
} from '@playwright/test';
import { expectJsonResponse } from '../assertions/api.assertions';
import type {
  PaginatedResponse,
  Product,
  ProductQueryParams,
} from '../types/product.types';

export class ProductsApi {
  constructor(private readonly request: APIRequestContext) {}

  async getProducts(
    params: ProductQueryParams = {},
  ): Promise<APIResponse> {
    return this.request.get('/products', {
      params: { ...params },
    });
  }

  async getProduct(productId: string): Promise<APIResponse> {
    return this.request.get(`/products/${productId}`);
  }

  async getRelatedProducts(productId: string): Promise<APIResponse> {
    return this.request.get(`/products/${productId}/related`);
  }

  async searchProducts(
    query: string,
    page?: number,
  ): Promise<APIResponse> {
    const params: {
      q: string;
      page?: number;
    } = {
      q: query,
    };

    if (page !== undefined) {
      params.page = page;
    }

    return this.request.get('/products/search', {
      params,
    });
  }

  async getAllProducts(
    params: Omit<ProductQueryParams, 'page'> = {},
  ): Promise<Product[]> {
    const products: Product[] = [];

    let page = 1;
    let lastPage: number;

    do {
      const response = await this.getProducts({
        ...params,
        page,
      });

      expectJsonResponse(response);

      const body: PaginatedResponse<Product> = await response.json();

      products.push(...body.data);

      lastPage = body.last_page;
      page++;
    } while (page <= lastPage);

    return products;
  }
}