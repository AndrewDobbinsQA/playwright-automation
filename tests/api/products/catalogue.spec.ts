import { test, expect } from '@playwright/test';
import { ProductsApi } from '../../../api/clients/ProductsApi';
import {
  expectJsonResponse,
  expectPagination,
} from '../../../api/assertions/api.assertions';
import { expectProductStructure } from '../../../api/assertions/product.assertions';
import type {
  PaginatedResponse,
  Product,
} from '../../../api/types/product.types';

test.describe('Product catalogue API', () => {
  test('should retrieve the product catalogue', async ({ request }) => {
    const productsApi = new ProductsApi(request);
    const response = await productsApi.getProducts();

    expectJsonResponse(response);

    const body: PaginatedResponse<Product> = await response.json();

    expectPagination(body, {
      current_page: 1,
      from: 1,
      last_page: 6,
      per_page: 9,
      to: 9,
      total: 50,
    });

    for (const product of body.data) {
      expectProductStructure(product);
    }

    const productIds = body.data.map(product => product.id);

    expect(new Set(productIds).size).toBe(body.data.length);
  });

  const paginationScenarios = [
    {
      description: 'second page',
      page: 2,
      currentPage: 2,
      from: 10,
      to: 18,
    },
    {
      description: 'final page',
      page: 6,
      currentPage: 6,
      from: 46,
      to: 50,
    },
    {
      description: 'page beyond the final page',
      page: 7,
      currentPage: 7,
      from: null,
      to: null,
    },
    {
      description: 'page zero',
      page: 0,
      currentPage: 1,
      from: 1,
      to: 9,
    },
    {
      description: 'negative page',
      page: -1,
      currentPage: 1,
      from: 1,
      to: 9,
    },
  ];

  for (const scenario of paginationScenarios) {
    test(`should handle pagination for ${scenario.description}`, async ({ request }) => {
      const productsApi = new ProductsApi(request);

      const response = await productsApi.getProducts({
        page: scenario.page,
      });

      expectJsonResponse(response);

      const body: PaginatedResponse<Product> = await response.json();

      expectPagination(body, {
        current_page: scenario.currentPage,
        from: scenario.from,
        last_page: 6,
        per_page: 9,
        to: scenario.to,
        total: 50,
      });
    });
  }

  test('should return unique products across catalogue pages', async ({ request }) => {
    const productsApi = new ProductsApi(request);
    const productIds: string[] = [];

    for (let page = 1; page <= 6; page++) {
      const response = await productsApi.getProducts({ page });

      expectJsonResponse(response);

      const body: PaginatedResponse<Product> = await response.json();

      expect(body.current_page).toBe(page);
      expect(body.total).toBe(50);

      for (const product of body.data) {
        expectProductStructure(product);
        productIds.push(product.id);
      }
    }

    expect(productIds).toHaveLength(50);
    expect(new Set(productIds).size).toBe(50);
  });
});