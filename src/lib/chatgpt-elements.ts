import { queryFindExactlyOneElement } from './xpath';

const queries = {
  //  Idenitifies mermaid code blacks that we haven't processed.
  //  TODO: needs to exclude the class we add to indicate processed.

  //  How this works:
  //  1. <code> tags
  //  2. with the 'hljs' class (highlight JS, which is applied to code blocks
  //     but not inline snippets (could also just limit search to code blocks
  //     that are descendants of pre tags).
  //  3. Doesn't contain 'chatgpt-digrams' - which we add when we've
  //     processed a tag.
  anyCodeBlocks: '//code[contains(@class, "hljs") and not(contains(@class, "chatgpt-diagrams"))]',
  mermaidCodeBlocks: '//code[contains(@class, "mermaid") and not contains(@class, "chatgpt-diagrams")]',
  associatedPreTag: 'ancestor::pre',
  associatedCopyCodeButton: 'ancestor::pre//button[contains(text(), "Copy")]',
};

export function getUnprocessedCodeBlocks(window: Window): Array<HTMLElement> {
  const result = window.document.evaluate(
    queries.anyCodeBlocks,
    window.document,
    null,
    //  @ts-expect-error - jsdom is missing the 'XPathResult' types...
    window.XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    null
  );

  return Array
    .from({ length: result.snapshotLength }, (_, index) => result.snapshotItem(index))
    .map(element => element as HTMLElement)
    .filter(element => element); // filter out null elements
}

export function getCodeElementAssociatedCopyButton(window: Window, codeElement: HTMLElement): HTMLElement {
  //  Get the parent 'pre' tag, as well as the 'copy' button.
  const copyButton = queryFindExactlyOneElement(
    window,
    queries.associatedCopyCodeButton,
    codeElement
  );
  return copyButton as HTMLElement;
}

export function getCodeElementAssociatedPreTag(window: Window, codeElement: HTMLElement): HTMLElement {
  //  Get the parent 'pre' tag, as well as the 'copy' button.
  const preTag = queryFindExactlyOneElement(
    window,
    queries.associatedPreTag,
    codeElement
  );
  return preTag as HTMLElement;
}
