import { test, expect } from '@playwright/test';
import { ProductsApi } from '../../../api/clients/ProductsApi';
import { expectJsonResponse } from '../../../api/assertions/api.assertions';
import { expectProductStructure } from '../../../api/assertions/product.assertions';
import type {
  ProductDetail,
  ApiErrorResponse,
} from '../../../api/types/product.types';

test.describe('Product details API', () => {
  test('should retrieve individual product details and specifications', async ({ request }) => {
    const productsApi = new ProductsApi(request);
    const catalogue = await productsApi.getAllProducts();

    const expectedProduct = catalogue.find(
      product => product.name === 'Combination Pliers',
    );

    if (!expectedProduct) {
      throw new Error("Product 'Combination Pliers' not found");
    }

    const response = await productsApi.getProduct(expectedProduct.id);

    expectJsonResponse(response);

    const body: ProductDetail = await response.json();

    expectProductStructure(body);

    expect(body).toMatchObject({ ...expectedProduct });

    expect(body.name).toBe('Combination Pliers');
    expect(body.price).toBe(14.15);
    expect(body.brand.name).toBe('ForgeFlex Tools');
    expect(body.category.name).toBe('Pliers');

    expect(body.category.parent_id).toEqual(expect.any(String));
    expect(body.category.parent_id).not.toBe('');

    const expectedSpecifications = [
      {
        spec_name: 'Handle Material',
        spec_value: 'Bi-component',
        spec_unit: null,
      },
      {
        spec_name: 'Length',
        spec_value: '200',
        spec_unit: 'mm',
      },
      {
        spec_name: 'Material',
        spec_value: 'Chrome Vanadium Steel',
        spec_unit: null,
      },
      {
        spec_name: 'Warranty',
        spec_value: '2',
        spec_unit: 'years',
      },
      {
        spec_name: 'Weight',
        spec_value: '340',
        spec_unit: 'g',
      },
    ];

    expect(Array.isArray(body.specs)).toBe(true);
    expect(body.specs).toHaveLength(expectedSpecifications.length);

    for (const specification of body.specs) {
      expect(specification).toMatchObject({
        id: expect.any(String),
        product_id: expectedProduct.id,
        spec_name: expect.any(String),
        spec_value: expect.any(String),
      });

      expect(specification.id).not.toBe('');
    }

    const specificationIds = body.specs.map(
      specification => specification.id,
    );

    expect(new Set(specificationIds).size).toBe(
      expectedSpecifications.length,
    );

    const actualSpecifications = body.specs.map(specification => ({
      spec_name: specification.spec_name,
      spec_value: specification.spec_value,
      spec_unit: specification.spec_unit,
    }));

    expect(actualSpecifications).toEqual(
      expect.arrayContaining(expectedSpecifications),
    );
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

        const response = await productsApi.getProduct(
          scenario.productId,
        );

        expectJsonResponse(response, 404);

        const body: ApiErrorResponse = await response.json();

        expect(body).toEqual({
          message: 'Requested item not found',
        });
      });
    }
  });
});