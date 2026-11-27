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

test.describe('Product filtering API', () => {
  test.describe('Category filtering', () => {
    const categoryScenarios = [
      {
        name: 'Pliers',
        expectedProducts: [
          'Combination Pliers',
          'Pliers',
          'Bolt Cutters',
          'Long Nose Pliers',
          'Slip Joint Pliers',
        ],
      },
      {
        name: 'Hammer',
        expectedProducts: [
          'Claw Hammer with Shock Reduction Grip',
          'Hammer',
          'Claw Hammer',
          'Thor Hammer',
          'Sledgehammer',
          'Claw Hammer with Fiberglass Handle',
          'Court Hammer',
        ],
      },
    ];

    for (const scenario of categoryScenarios) {
      test(`should filter products by '${scenario.name}' category`, async ({ request }) => {
        const productsApi = new ProductsApi(request);
        const catalogue = await productsApi.getAllProducts();

        const category = catalogue.find(
          product => product.category.name === scenario.name,
        )?.category;

        if (!category) {
          throw new Error(`Category '${scenario.name}' not found`);
        }

        const response = await productsApi.getProducts({
          by_category: category.id,
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
          expect(product.category.id).toBe(category.id);
          expect(product.category.name).toBe(scenario.name);
        }

        const actualNames = body.data.map(product => product.name);

        expect(actualNames.sort()).toEqual(
          [...scenario.expectedProducts].sort(),
        );
      });
    }

    test('should return no products for a nonexistent category', async ({ request }) => {
      const productsApi = new ProductsApi(request);

      const response = await productsApi.getProducts({
        by_category: 'nonexistent-category',
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
  });

  test.describe('Brand filtering', () => {
    const brandScenarios = [
      {
        name: 'ForgeFlex Tools',
        expectedTotal: 40,
        expectedPages: 5,
      },
      {
        name: 'MightyCraft Hardware',
        expectedTotal: 10,
        expectedPages: 2,
      },
    ];

    for (const scenario of brandScenarios) {
      test(`should filter products by '${scenario.name}' brand`, async ({ request }) => {
        const productsApi = new ProductsApi(request);
        const catalogue = await productsApi.getAllProducts();

        const brand = catalogue.find(
          product => product.brand.name === scenario.name,
        )?.brand;

        if (!brand) {
          throw new Error(`Brand '${scenario.name}' not found`);
        }

        const filteredProducts: Product[] = [];

        for (let page = 1; page <= scenario.expectedPages; page++) {
          const response = await productsApi.getProducts({
            by_brand: brand.id,
            page,
          });

          expectJsonResponse(response);

          const body: PaginatedResponse<Product> = await response.json();

          expectPagination(body, {
            current_page: page,
            from: (page - 1) * 9 + 1,
            last_page: scenario.expectedPages,
            per_page: 9,
            to: Math.min(page * 9, scenario.expectedTotal),
            total: scenario.expectedTotal,
          });

          for (const product of body.data) {
            expectProductStructure(product);
            expect(product.brand.id).toBe(brand.id);
            expect(product.brand.name).toBe(scenario.name);

            filteredProducts.push(product);
          }
        }

        const actualIds = filteredProducts.map(product => product.id);

        const expectedIds = catalogue
          .filter(product => product.brand.id === brand.id)
          .map(product => product.id);

        expect(filteredProducts).toHaveLength(scenario.expectedTotal);
        expect(new Set(actualIds).size).toBe(scenario.expectedTotal);
        expect(actualIds.sort()).toEqual(expectedIds.sort());
      });
    }

    test('should return no products for a nonexistent brand', async ({ request }) => {
      const productsApi = new ProductsApi(request);

      const response = await productsApi.getProducts({
        by_brand: 'nonexistent-brand',
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
  });
});