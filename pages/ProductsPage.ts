import { type Page, type Locator } from '@playwright/test';

export class ProductsPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly searchCaption: Locator;
  readonly searchResultCount: Locator;
  readonly noResultsMessage: Locator;
  readonly productCards: Locator;
  readonly productNames: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByTestId('search-query');
    this.searchButton = page.getByTestId('search-submit');
    this.searchCaption = page.getByTestId('search-caption');
    this.searchResultCount = page.getByTestId('search-result-count');
    this.noResultsMessage = page.getByTestId('no-results');
    this.productCards = page
      .getByTestId(/^product-/)
      .and(page.getByRole('link'));
    this.productNames = this.productCards.getByTestId('product-name');
  }

  async goto() {
    await this.page.goto('/');
  }

  async search(searchTerm: string) {
    await this.searchInput.fill(searchTerm);
    await this.searchButton.click();
  }

  getCategoryCheckbox(categoryName: string): Locator {
    return this.page.getByRole('checkbox', {
      name: categoryName,
      exact: true,
    });
  }

  async selectCategory(categoryName: string) {
    await this.getCategoryCheckbox(categoryName).check();
  }
}