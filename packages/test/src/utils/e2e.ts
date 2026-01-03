import { AssertionError } from "./error";

export interface WaitForElementOptions {
  timeout?: number;
  interval?: number;
}

/**
 * Waits for a specific element to appear in the DOM.
 * Useful for E2E tests where UI elements may load asynchronously.
 *
 * @param selector - The CSS selector of the element to wait for.
 * @param options - Options for timeout and polling interval.
 * @returns A promise that resolves with the element when it's found.
 */
export function waitForElement(
  selector: string,
  options: WaitForElementOptions = {}
): Promise<Element> {
  const { timeout = 5000, interval = 50 } = options;

  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const checkElement = () => {
      const element = document.querySelector(selector);

      if (element) {
        resolve(element);
      } else if (Date.now() - startTime > timeout) {
        reject(new AssertionError(`Element with selector '${selector}' did not appear within ${timeout}ms.`));
      } else {
        setTimeout(checkElement, interval);
      }
    };

    checkElement();
  });
}
