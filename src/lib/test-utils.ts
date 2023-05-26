export function elementByTestId(
  document: Document,
  testId: string
): HTMLElement {
  const element = document.querySelector(
    `[data-test-id=${testId}]`
  ) as HTMLElement;
  if (!element) {
    throw new Error(`Unable to find element with test id '${testId}'`);
  }

  return element;
}
