import { expect } from '@playwright/test';
import type {
  BaseProduct,
  SearchProduct,
  Product,
} from '../types/product.types';

export function expectBaseProductStructure(product: BaseProduct): void {
  expect(product).toMatchObject({
    id: expect.any(String),
    name: expect.any(String),
    description: expect.any(String),
    price: expect.any(Number),
    is_location_offer: expect.any(Boolean),
    is_rental: expect.any(Boolean),
    in_stock: expect.any(Boolean),
    brand: {
      id: expect.any(String),
      name: expect.any(String),
    },
    category: {
      id: expect.any(String),
      name: expect.any(String),
    },
    product_image: {
      id: expect.any(String),
      by_name: expect.any(String),
      by_url: expect.any(String),
      source_name: expect.any(String),
      source_url: expect.any(String),
      file_name: expect.any(String),
      title: expect.any(String),
    },
  });

  expect(product.id).not.toBe('');
  expect(product.name.trim()).not.toBe('');
  expect(product.price).toBeGreaterThanOrEqual(0);
}

export function expectSearchProductStructure(product: SearchProduct): void {
  expectBaseProductStructure(product);

  expect(product).toMatchObject({
    co2_rating: expect.any(String),
    is_eco_friendly: expect.any(Boolean),
  });
}

export function expectProductStructure(product: Product): void {
  expectSearchProductStructure(product);

  expect(product).toMatchObject({
    category: {
      slug: expect.any(String),
    },
  });
}