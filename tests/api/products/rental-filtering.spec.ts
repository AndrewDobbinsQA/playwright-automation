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

const rentalProductNames = [
  'Excavator',
  'Bulldozer',
  'Crane',
];

const drillProductNames = [
  'Cordless Drill 20V',
  'Cordless Drill 24V',
  'Cordless Drill 18V',
  'Cordless Drill 12V',
];

test.describe('Product rental filtering API', () => {
  test.describe('Rental parameter filtering', () => {
    const rentalScenarios = [
      {
        description: 'boolean string',
        value: 'true',
      },
      {
        description: 'numeric string',
        value: '1',
      },
    ];

    for (const scenario of rentalScenarios) {
      test(`should retrieve rental products using a ${scenario.description}`, async ({ request }) => {
        const productsApi = new ProductsApi(request);

        const response = await productsApi.getProducts({
          is_rental: scenario.value,
        });

        expectJsonResponse(response);

        const body: PaginatedResponse<Product> = await response.json();

        expectPagination(body, {
          current_page: 1,
          from: 1,
          last_page: 1,
          per_page: 9,
          to: 3,
          total: 3,
        });

        for (const product of body.data) {
          expectProductStructure(product);
          expect(product.is_rental).toBe(true);
        }

        const actualNames = body.data.map(product => product.name);

        expect(actualNames.sort()).toEqual(
          [...rentalProductNames].sort(),
        );
      });
    }
  });

  test.describe('Rental and category interactions', () => {
    const categoryScenarios = [
      {
        description: 'non-rental Drill products by default',
        categoryName: 'Drill',
        rentalValue: undefined,
        expectedRental: false,
        expectedProducts: drillProductNames,
      },
      {
        description: 'non-rental Drill products explicitly',
        categoryName: 'Drill',
        rentalValue: 'false',
        expectedRental: false,
        expectedProducts: drillProductNames,
      },
      {
        description: 'rental products within the Drill category',
        categoryName: 'Drill',
        rentalValue: 'true',
        expectedRental: true,
        expectedProducts: rentalProductNames,
      },
      {
        description: 'no rental products within the Pliers category',
        categoryName: 'Pliers',
        rentalValue: 'true',
        expectedRental: true,
        expectedProducts: [],
      },
    ];

    for (const scenario of categoryScenarios) {
      test(`should return ${scenario.description}`, async ({ request }) => {
        const productsApi = new ProductsApi(request);
        const catalogue = await productsApi.getAllProducts();

        const category = catalogue.find(
          product => product.category.name === scenario.categoryName,
        )?.category;

        if (!category) {
          throw new Error(
            `Category '${scenario.categoryName}' not found`,
          );
        }

        const params: ProductQueryParams = {
          by_category: category.id,
        };

        if (scenario.rentalValue !== undefined) {
          params.is_rental = scenario.rentalValue;
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
          expect(product.category.name).toBe(scenario.categoryName);
          expect(product.is_rental).toBe(scenario.expectedRental);
        }

        const actualNames = body.data.map(product => product.name);

        expect(actualNames.sort()).toEqual(
          [...scenario.expectedProducts].sort(),
        );
      });
    }
  });
});