import { expect } from '@playwright/test';
import type { APIResponse } from '@playwright/test';
import type { PaginatedResponse } from '../types/product.types';

export function expectJsonResponse(
  response: APIResponse,
  expectedStatus: number = 200,
): void {
  expect(response.status(), 'HTTP status code').toBe(expectedStatus);

  expect(
    response.headers()['content-type'],
    'Response content type',
  ).toContain('application/json');
}

export function expectPagination<T>(
  body: PaginatedResponse<T>,
  expected: Omit<PaginatedResponse<T>, 'data'>,
): void {
  expect(body.current_page, 'Current page').toBe(expected.current_page);
  expect(body.from, 'First result position').toBe(expected.from);
  expect(body.last_page, 'Last page').toBe(expected.last_page);
  expect(body.per_page, 'Results per page').toBe(expected.per_page);
  expect(body.to, 'Last result position').toBe(expected.to);
  expect(body.total, 'Total results').toBe(expected.total);

  expect(Array.isArray(body.data), 'Data is an array').toBe(true);

  const expectedCount =
    expected.from === null || expected.to === null
      ? 0
      : expected.to - expected.from + 1;

  expect(body.data, 'Number of returned results').toHaveLength(expectedCount);
}