import { test, expect } from '@playwright/test';
import { ProductsApi } from '../../../api/clients/ProductsApi';
import {
  expectJsonResponse,
  expectPagination,
} from '../../../api/assertions/api.assertions';
import { expectSearchProductStructure } from '../../../api/assertions/product.assertions';
import type {
  PaginatedResponse,
  SearchProduct,
} from '../../../api/types/product.types';

const pliersProductNames = [
  'Combination Pliers',
  'Pliers',
  'Long Nose Pliers',
  'Slip Joint Pliers',
];

const hammerProductNames = [
  'Claw Hammer with Shock Reduction Grip',
  'Hammer',
  'Claw Hammer',
  'Thor Hammer',
  'Sledgehammer',
  'Claw Hammer with Fiberglass Handle',
  'Court Hammer',
];

test.describe('Product search API', () => {
  test.describe('Successful product searches', () => {
    const searchScenarios = [
      {
        description: 'a partial product name',
        query: 'pliers',
        expectedProducts: pliersProductNames,
      },
      {
        description: 'a partial hammer search term',
        query: 'ham',
        expectedProducts: hammerProductNames,
      },
      {
        description: 'a partial Sledgehammer search term',
        query: 'sledge',
        expectedProducts: ['Sledgehammer'],
      },
      {
        description: 'an exact product name',
        query: 'sledgehammer',
        expectedProducts: ['Sledgehammer'],
      },
      {
        description: 'an uppercase search term',
        query: 'PLIERS',
        expectedProducts: pliersProductNames,
      },
      {
        description: 'a mixed-case search term',
        query: 'PliErS',
        expectedProducts: pliersProductNames,
      },
      {
        description: 'leading whitespace',
        query: ' pliers',
        expectedProducts: pliersProductNames,
      },
      {
        description: 'trailing whitespace',
        query: 'pliers ',
        expectedProducts: pliersProductNames,
      },
      {
        description: 'surrounding whitespace',
        query: ' pliers ',
        expectedProducts: pliersProductNames,
      },
    ];

    for (const scenario of searchScenarios) {
      test(`should return matching products for ${scenario.description}`, async ({ request }) => {
        const productsApi = new ProductsApi(request);

        const response = await productsApi.searchProducts(
          scenario.query,
        );

        expectJsonResponse(response);

        const body: PaginatedResponse<SearchProduct> =
          await response.json();

        const expectedTotal = scenario.expectedProducts.length;

        expectPagination(body, {
          current_page: 1,
          from: 1,
          last_page: 1,
          per_page: 9,
          to: expectedTotal,
          total: expectedTotal,
        });

        const normalisedQuery = scenario.query.trim().toLowerCase();

        for (const product of body.data) {
          expectSearchProductStructure(product);

          expect(product.name.toLowerCase()).toContain(
            normalisedQuery,
          );
        }

        const actualNames = body.data.map(product => product.name);
        const actualIds = body.data.map(product => product.id);

        expect(actualNames.sort()).toEqual(
          [...scenario.expectedProducts].sort(),
        );

        expect(new Set(actualIds).size).toBe(expectedTotal);
      });
    }
  });

  test.describe('Unsuccessful and empty searches', () => {
    const emptySearchScenarios = [
      {
        description: 'a nonexistent product name',
        query: 'nonexistentproduct',
      },
      {
        description: 'an empty search term',
        query: '',
      },
      {
        description: 'a whitespace-only search term',
        query: '   ',
      },
    ];

    for (const scenario of emptySearchScenarios) {
      test(`should return no products for ${scenario.description}`, async ({ request }) => {
        const productsApi = new ProductsApi(request);

        const response = await productsApi.searchProducts(
          scenario.query,
        );

        expectJsonResponse(response);

        const body: PaginatedResponse<SearchProduct> =
          await response.json();

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

  test.describe('Search result pagination', () => {
    test('should return matching search results across multiple pages', async ({ request }) => {
      const productsApi = new ProductsApi(request);

      const catalogue = await productsApi.getAllProducts();

      const rentalCatalogue = await productsApi.getAllProducts({
        is_rental: 'true',
      });

      // Search results include standard and rental products.
      const searchableProducts = [
        ...catalogue,
        ...rentalCatalogue,
      ];

      const searchResults: SearchProduct[] = [];

      const query = 'a';
      const expectedTotal = 35;
      const expectedPages = 4;
      const productsPerPage = 9;

      for (let page = 1; page <= expectedPages; page++) {
        const response = await productsApi.searchProducts(
          query,
          page,
        );

        expectJsonResponse(response);

        const body: PaginatedResponse<SearchProduct> =
          await response.json();

        expectPagination(body, {
          current_page: page,
          from: (page - 1) * productsPerPage + 1,
          last_page: expectedPages,
          per_page: productsPerPage,
          to: Math.min(page * productsPerPage, expectedTotal),
          total: expectedTotal,
        });

        for (const product of body.data) {
          expectSearchProductStructure(product);

          expect(product.name.toLowerCase()).toContain(query);

          searchResults.push(product);
        }
      }

      const actualIds = searchResults.map(product => product.id);

      const expectedIds = searchableProducts
        .filter(product =>
          product.name.toLowerCase().includes(query),
        )
        .map(product => product.id);

      expect(searchResults).toHaveLength(expectedTotal);
      expect(new Set(actualIds).size).toBe(expectedTotal);

      expect(actualIds.sort()).toEqual(expectedIds.sort());
    });

    test('should handle search pagination boundaries', async ({ request }) => {
      const productsApi = new ProductsApi(request);

      await test.step('Validate a page beyond the last page', async () => {
        const response = await productsApi.searchProducts(
          'pliers',
          2,
        );

        expectJsonResponse(response);

        const body: PaginatedResponse<SearchProduct> =
          await response.json();

        expectPagination(body, {
          current_page: 2,
          from: null,
          last_page: 1,
          per_page: 9,
          to: null,
          total: 4,
        });
      });

      await test.step('Validate fallback to page one when page zero is supplied', async () => {
        const response = await productsApi.searchProducts(
          'pliers',
          0,
        );

        expectJsonResponse(response);

        const body: PaginatedResponse<SearchProduct> =
          await response.json();

        expectPagination(body, {
          current_page: 1,
          from: 1,
          last_page: 1,
          per_page: 9,
          to: 4,
          total: 4,
        });

        for (const product of body.data) {
          expectSearchProductStructure(product);
        }

        const actualNames = body.data.map(product => product.name);

        expect(actualNames.sort()).toEqual(
          [...pliersProductNames].sort(),
        );
      });
    });
  });
});