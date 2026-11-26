import { expect, type Locator } from '@playwright/test';

export async function expectUnorderedTextContents(
  locator: Locator,
  expectedTexts: readonly string[]
) {
  await expect.poll(async () => {
    const actualTexts = await locator.allTextContents();
    return actualTexts.map(text => text.trim()).sort();
  }).toEqual([...expectedTexts].sort());
}