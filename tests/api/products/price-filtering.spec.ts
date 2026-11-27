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

test.describe('Product price filtering API', () => {
  test('should filter products within a price range across multiple pages', async ({ request }) => {
    const productsApi = new ProductsApi(request);
    const catalogue = await productsApi.getAllProducts();
    const filteredProducts: Product[] = [];

    const minimumPrice = 10;
    const maximumPrice = 15;
    const expectedTotal = 13;
    const expectedPages = 2;

    for (let page = 1; page <= expectedPages; page++) {
      const response = await productsApi.getProducts({
        between: `price,${minimumPrice},${maximumPrice}`,
        page,
      });

      expectJsonResponse(response);

      const body: PaginatedResponse<Product> = await response.json();

      expectPagination(body, {
        current_page: page,
        from: (page - 1) * 9 + 1,
        last_page: expectedPages,
        per_page: 9,
        to: Math.min(page * 9, expectedTotal),
        total: expectedTotal,
      });

      for (const product of body.data) {
        expectProductStructure(product);
        expect(product.price).toBeGreaterThanOrEqual(minimumPrice);
        expect(product.price).toBeLessThanOrEqual(maximumPrice);

        filteredProducts.push(product);
      }
    }

    const actualIds = filteredProducts.map(product => product.id);

    const expectedIds = catalogue
      .filter(
        product =>
          product.price >= minimumPrice &&
          product.price <= maximumPrice,
      )
      .map(product => product.id);

    expect(filteredProducts).toHaveLength(expectedTotal);
    expect(new Set(actualIds).size).toBe(expectedTotal);
    expect(actualIds.sort()).toEqual(expectedIds.sort());
  });

  test.describe('Price boundary validation', () => {
    const boundaryScenarios = [
      {
        description: 'identical minimum and maximum prices',
        minimumPrice: 14.15,
        maximumPrice: 14.15,
        expectedProducts: [
          {
            name: 'Combination Pliers',
            price: 14.15,
          },
        ],
      },
      {
        description: 'inclusive lower and upper price boundaries',
        minimumPrice: 14.14,
        maximumPrice: 14.15,
        expectedProducts: [
          {
            name: 'Angled Spanner',
            price: 14.14,
          },
          {
            name: 'Combination Pliers',
            price: 14.15,
          },
        ],
      },
      {
        description: 'exclusion of products below the minimum price',
        minimumPrice: 14.15,
        maximumPrice: 14.16,
        expectedProducts: [
          {
            name: 'Combination Pliers',
            price: 14.15,
          },
        ],
      },
    ];

    for (const scenario of boundaryScenarios) {
      test(`should handle ${scenario.description}`, async ({ request }) => {
        const productsApi = new ProductsApi(request);

        const response = await productsApi.getProducts({
          between: `price,${scenario.minimumPrice},${scenario.maximumPrice}`,
        });

        expectJsonResponse(response);

        const body: PaginatedResponse<Product> = await response.json();

        expectPagination(body, {
          current_page: 1,
          from: 1,
          last_page: 1,
          per_page: 9,
          to: scenario.expectedProducts.length,
          total: scenario.expectedProducts.length,
        });

        for (const product of body.data) {
          expectProductStructure(product);
          expect(product.price).toBeGreaterThanOrEqual(scenario.minimumPrice);
          expect(product.price).toBeLessThanOrEqual(scenario.maximumPrice);
        }

        const actualProducts = body.data.map(product => ({
          name: product.name,
          price: product.price,
        }));

        expect(actualProducts).toEqual(
          expect.arrayContaining(scenario.expectedProducts),
        );
      });
    }
  });

  test.describe('Invalid price ranges', () => {
    const invalidRangeScenarios = [
      {
        description: 'a reversed price range',
        between: 'price,30,10',
      },
      {
        description: 'nonnumeric price boundaries',
        between: 'price,abc,xyz',
      },
    ];

    for (const scenario of invalidRangeScenarios) {
      test(`should return no products for ${scenario.description}`, async ({ request }) => {
        const productsApi = new ProductsApi(request);

        const response = await productsApi.getProducts({
          between: scenario.between,
        });

        expectJsonResponse(response);

        const body: PaginatedResponse<Product> = await response.json();

        expectPagination(body, {
          current_page: 1,
          from: null,
          last_page: 1,
          per_page: 9,
          to: null,
          total: 0,
        });
      });
    }
  });
});