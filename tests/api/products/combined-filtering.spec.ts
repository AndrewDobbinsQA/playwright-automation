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
  ProductQueryParams,
} from '../../../api/types/product.types';

test.describe('Product combined filtering API', () => {
  const combinedScenarios = [
    {
      description: 'category and brand filters',
      priceRange: undefined,
      expectedProducts: [
        'Combination Pliers',
        'Pliers',
      ],
    },
    {
      description: 'category, brand and matching price filters',
      priceRange: {
        minimum: 10,
        maximum: 13,
      },
      expectedProducts: [
        'Pliers',
      ],
    },
    {
      description: 'category, brand and non-matching price filters',
      priceRange: {
        minimum: 20,
        maximum: 50,
      },
      expectedProducts: [],
    },
  ];

  for (const scenario of combinedScenarios) {
    test(`should apply ${scenario.description}`, async ({ request }) => {
      const productsApi = new ProductsApi(request);
      const catalogue = await productsApi.getAllProducts();

      const category = catalogue.find(
        product => product.category.name === 'Pliers',
      )?.category;

      const brand = catalogue.find(
        product => product.brand.name === 'ForgeFlex Tools',
      )?.brand;

      if (!category) {
        throw new Error("Category 'Pliers' not found");
      }

      if (!brand) {
        throw new Error("Brand 'ForgeFlex Tools' not found");
      }

      const params: ProductQueryParams = {
        by_category: category.id,
        by_brand: brand.id,
      };

      if (scenario.priceRange) {
        params.between =
          `price,${scenario.priceRange.minimum},${scenario.priceRange.maximum}`;
      }

      const response = await productsApi.getProducts(params);

      expectJsonResponse(response);

      const body: PaginatedResponse<Product> = await response.json();
      const expectedTotal = scenario.expectedProducts.length;

      expectPagination(body, {
        current_page: 1,
        from: expectedTotal > 0 ? 1 : null,
        last_page: 1,
        per_page: 9,
        to: expectedTotal > 0 ? expectedTotal : null,
        total: expectedTotal,
      });

      for (const product of body.data) {
        expectProductStructure(product);

        expect(product.category.id).toBe(category.id);
        expect(product.category.name).toBe('Pliers');

        expect(product.brand.id).toBe(brand.id);
        expect(product.brand.name).toBe('ForgeFlex Tools');

        if (scenario.priceRange) {
          expect(product.price).toBeGreaterThanOrEqual(
            scenario.priceRange.minimum,
          );

          expect(product.price).toBeLessThanOrEqual(
            scenario.priceRange.maximum,
          );
        }
      }

      const actualNames = body.data.map(product => product.name);

      expect(actualNames.sort()).toEqual(
        [...scenario.expectedProducts].sort(),
      );

      const expectedIds = catalogue
        .filter(product => {
          const matchesCategory =
            product.category.id === category.id;

          const matchesBrand =
            product.brand.id === brand.id;

          const matchesPrice =
            !scenario.priceRange ||
            (
              product.price >= scenario.priceRange.minimum &&
              product.price <= scenario.priceRange.maximum
            );

          return matchesCategory && matchesBrand && matchesPrice;
        })
        .map(product => product.id);

      const actualIds = body.data.map(product => product.id);

      expect(actualIds.sort()).toEqual(expectedIds.sort());
    });
  }
});