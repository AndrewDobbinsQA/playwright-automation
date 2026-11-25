import { test, expect } from '@playwright/test';
import { ProductsPage } from '../../pages/ProductsPage';
import { expectUnorderedTextContents } from '../../helpers/assertions';

const successfulSearchScenarios = [
  {
    searchTerm: 'pliers',
    expectedProducts: [
      'Combination Pliers',
      'Pliers',
      'Long Nose Pliers',
      'Slip Joint Pliers',
    ],
  },
  {
    searchTerm: 'ham',
    expectedProducts: [
      'Claw Hammer with Shock Reduction Grip',
      'Hammer',
      'Claw Hammer',
      'Thor Hammer',
      'Claw Hammer with Fiberglass Handle',
      'Court Hammer',
      'Sledgehammer',
    ],
  },
  {
    searchTerm: 'sledgehammer',
    expectedProducts: [
      'Sledgehammer',
    ],
  },
];

const categoryFilterScenarios = [
  {
    categoryName: 'Pliers',
    expectedProducts: [
      'Combination Pliers',
      'Pliers',
      'Bolt Cutters',
      'Long Nose Pliers',
      'Slip Joint Pliers',
    ],
  },
  {
    categoryName: 'Hammer',
    expectedProducts: [
      'Claw Hammer with Shock Reduction Grip',
      'Hammer',
      'Claw Hammer',
      'Thor Hammer',
      'Claw Hammer with Fiberglass Handle',
      'Court Hammer',
      'Sledgehammer',
    ],
  },
];

for (const { searchTerm, expectedProducts } of successfulSearchScenarios) {
  test(`product search returns expected results for '${searchTerm}'`, async ({ page }) => {
    const productsPage = new ProductsPage(page);

    await productsPage.goto();
    await productsPage.search(searchTerm);

    const productCount = expectedProducts.length;
    const productLabel = productCount === 1 ? 'product' : 'products';

    await expect(productsPage.searchCaption).toHaveText(
      `Searched for: ${searchTerm}`
    );

    await expect(productsPage.searchResultCount).toHaveText(
      `${productCount} ${productLabel} found for '${searchTerm}'`
    );

    await expect(productsPage.productCards).toHaveCount(productCount);

    await expectUnorderedTextContents(
      productsPage.productNames,
      expectedProducts
    );

    await expect(productsPage.searchInput).toHaveValue('');
  });
}

test('product search returns no results for a nonexistent product', async ({ page }) => {
  const productsPage = new ProductsPage(page);
  const searchTerm = 'nonexistentproduct';

  await productsPage.goto();
  await productsPage.search(searchTerm);

  await expect(productsPage.searchCaption).toHaveText(
    `Searched for: ${searchTerm}`
  );

  await expect(productsPage.searchResultCount).toHaveText(
    `0 products found for '${searchTerm}'`
  );

  await expect(productsPage.noResultsMessage).toHaveText(
    'There are no products found.'
  );

  await expect(productsPage.productCards).toHaveCount(0);
  await expect(productsPage.searchInput).toHaveValue('');
});

for (const { categoryName, expectedProducts } of categoryFilterScenarios) {
  test(`category filter returns expected products for '${categoryName}'`, async ({ page }) => {
    const productsPage = new ProductsPage(page);

    await productsPage.goto();
    await productsPage.selectCategory(categoryName);

    await expect(
      productsPage.getCategoryCheckbox(categoryName)
    ).toBeChecked();

    await expect(productsPage.productCards).toHaveCount(
      expectedProducts.length
    );

    await expectUnorderedTextContents(
      productsPage.productNames,
      expectedProducts
    );
  });
}