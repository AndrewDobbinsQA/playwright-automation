import { test, expect } from '@playwright/test';
import { ProductsApi } from '../../../api/clients/ProductsApi';
import { expectJsonResponse } from '../../../api/assertions/api.assertions';
import { expectBaseProductStructure } from '../../../api/assertions/product.assertions';
import type {
  RelatedProduct,
  ApiErrorResponse,
} from '../../../api/types/product.types';

test.describe('Related products API', () => {
  test.describe('Valid product identifiers', () => {
    const relatedProductScenarios = [
      {
        productName: 'Combination Pliers',
        expectedCategory: 'Pliers',
        expectedProducts: [
          'Pliers',
          'Bolt Cutters',
          'Long Nose Pliers',
          'Slip Joint Pliers',
        ],
      },
      {
        productName: 'Hammer',
        expectedCategory: 'Hammer',
        expectedProducts: [
          'Claw Hammer with Shock Reduction Grip',
          'Claw Hammer',
          'Thor Hammer',
          'Sledgehammer',
          'Claw Hammer with Fiberglass Handle',
          'Court Hammer',
        ],
      },
    ];

    for (const scenario of relatedProductScenarios) {
      test(`should retrieve related products for ${scenario.productName}`, async ({ request }) => {
        const productsApi = new ProductsApi(request);
        const catalogue = await productsApi.getAllProducts();

        const sourceProduct = catalogue.find(
          product => product.name === scenario.productName,
        );

        if (!sourceProduct) {
          throw new Error(
            `Product '${scenario.productName}' not found`,
          );
        }

        const response = await productsApi.getRelatedProducts(
          sourceProduct.id,
        );

        expectJsonResponse(response);

        const body: RelatedProduct[] = await response.json();

        expect(Array.isArray(body)).toBe(true);
        expect(body).toHaveLength(
          scenario.expectedProducts.length,
        );

        for (const product of body) {
          expectBaseProductStructure(product);

          expect(product.id).not.toBe(sourceProduct.id);
          expect(product.category.id).toBe(
            sourceProduct.category.id,
          );
          expect(product.category.name).toBe(
            scenario.expectedCategory,
          );
        }

        const actualNames = body.map(product => product.name);
        const actualIds = body.map(product => product.id);

        expect(actualNames.sort()).toEqual(
          [...scenario.expectedProducts].sort(),
        );

        expect(new Set(actualIds).size).toBe(body.length);

        const expectedIds = catalogue
          .filter(
            product =>
              product.category.id === sourceProduct.category.id &&
              product.id !== sourceProduct.id,
          )
          .map(product => product.id);

        expect(actualIds.sort()).toEqual(expectedIds.sort());
      });
    }
  });

  test.describe('Invalid product identifiers', () => {
    const invalidProductScenarios = [
      {
        description: 'a nonexistent product ID',
        productId: '00000000000000000000000000',
      },
      {
        description: 'a malformed product ID',
        productId: 'invalid-product-id',
      },
    ];

    for (const scenario of invalidProductScenarios) {
      test(`should return HTTP 404 for ${scenario.description}`, async ({ request }) => {
        const productsApi = new ProductsApi(request);

        const response = await productsApi.getRelatedProducts(
          scenario.productId,
        );

        expect(response.headers()['content-type']).toContain(
          'application/json',
        );

        const body: ApiErrorResponse = await response.json();

        if (response.status() === 500) {
          expect(body.message).toBe(
            `Product with ID ${scenario.productId} not found`,
          );
        }

        test.fail(
          response.status() === 500,
          'Known defect: https://github.com/AndrewDobbinsQA/playwright-automation/issues/12',
        );

        expectJsonResponse(response, 404);

        expect(body).toEqual({
          message: 'Requested item not found',
        });
      });
    }
  });
});