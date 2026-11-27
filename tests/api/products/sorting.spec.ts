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

test.describe('Product sorting API', () => {
  const sortingScenarios = [
    {
      description: 'name in ascending order',
      sort: 'name,asc',
      field: 'name',
      direction: 'asc',
    },
    {
      description: 'name in descending order',
      sort: 'name,desc',
      field: 'name',
      direction: 'desc',
    },
    {
      description: 'price in ascending order',
      sort: 'price,asc',
      field: 'price',
      direction: 'asc',
    },
    {
      description: 'price in descending order',
      sort: 'price,desc',
      field: 'price',
      direction: 'desc',
    },
  ] as const;

  for (const scenario of sortingScenarios) {
    test(`should sort products by ${scenario.description}`, async ({ request }) => {
      const productsApi = new ProductsApi(request);
      const catalogue = await productsApi.getAllProducts();
      const sortedProducts: Product[] = [];

      const expectedTotal = 50;
      const expectedPages = 6;
      const productsPerPage = 9;

      for (let page = 1; page <= expectedPages; page++) {
        const response = await productsApi.getProducts({
          sort: scenario.sort,
          page,
        });

        expectJsonResponse(response);

        const body: PaginatedResponse<Product> = await response.json();

        expectPagination(body, {
          current_page: page,
          from: (page - 1) * productsPerPage + 1,
          last_page: expectedPages,
          per_page: productsPerPage,
          to: Math.min(page * productsPerPage, expectedTotal),
          total: expectedTotal,
        });

        for (const product of body.data) {
          expectProductStructure(product);
          sortedProducts.push(product);
        }
      }

      const actualIds = sortedProducts.map(product => product.id);
      const expectedIds = catalogue.map(product => product.id);

      expect(sortedProducts).toHaveLength(expectedTotal);
      expect(new Set(actualIds).size).toBe(expectedTotal);
      expect([...actualIds].sort()).toEqual([...expectedIds].sort());

      if (scenario.field === 'name') {
        const actualNames = sortedProducts.map(product => product.name);

        const expectedNames = catalogue
          .map(product => product.name)
          .sort((first, second) =>
            scenario.direction === 'asc'
              ? first.localeCompare(second, 'en', { sensitivity: 'base' })
              : second.localeCompare(first, 'en', { sensitivity: 'base' }),
          );

        expect(actualNames, 'Product name ordering').toEqual(expectedNames);
      } else {
        const actualPrices = sortedProducts.map(product => product.price);

        const expectedPrices = catalogue
          .map(product => product.price)
          .sort((first, second) =>
            scenario.direction === 'asc'
              ? first - second
              : second - first,
          );

        expect(actualPrices, 'Product price ordering').toEqual(expectedPrices);
      }
    });
  }
});