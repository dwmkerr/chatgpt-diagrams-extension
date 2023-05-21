export type ChatGPTCodeDOM = {
  //  The overall container 'pre' tag that holds the frame, buttons and code.
  preElement: HTMLPreElement;

  //  The 'copy code' button, we use this to quickly get a handle on the toolbar
  //  and insert adjacent buttons.
  copyCodeButton: HTMLButtonElement;

  //  The 'code' element that contains the mermaid code.
  codeElement: HTMLElement;
};

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
  anyCodeBlocks:
    '//code[contains(@class, "hljs") and not(contains(@class, "chatgpt-diagrams"))]',
  mermaidCodeBlocks:
    '//code[contains(@class, "mermaid") and not contains(@class, "chatgpt-diagrams")]',
  associatedPreTag: "ancestor::pre",
  associatedCopyCodeButton: 'ancestor::pre//button[contains(text(), "Copy")]',
};

/**
 * queryFindExactlyOneElement.
 *
 * @param {} document - the DOM document
 * @param {} xpathQuery - the XPath query to run
 * @param {} contextNode - the context node to start the query from, or null
 */
export function queryFindExactlyOneElement(
  document: Document,
  xpathQuery: string,
  contextNode: Element
) {
  //  Run the xpath query, retrieving a snapshop.
  const snapshot = document.evaluate(
    xpathQuery,
    contextNode,
    null,
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    null
  );

  //  If we did not find the expected number of results, bail.
  if (snapshot.snapshotLength !== 1) {
    const errorMessage = `failed to find exactly one element when running query '${xpathQuery}' - ${snapshot.snapshotLength} element(s) were found`;
    throw new Error(errorMessage);
  }

  //  Return the element we found.
  return snapshot.snapshotItem(0);
}

export function findCodeBlocks(document: Document): Array<ChatGPTCodeDOM> {
  //  This function takes the containing pre tag for the code sample, and
  //  returns the child elements we will be using to manipulate the DOM.
  const preToDOM = (preTag: HTMLPreElement) => {
    //  Get the 'copy code' button - I've not found a clean way to do consistently
    //  with query selectors, so use XPath.
    const copyCodeButton = queryFindExactlyOneElement(
      document,
      './/button[contains(text(), "Copy")]',
      preTag
    );
    //  Get the 'code' element that has the actual mermaid code sample.
    const codeElement = preTag.querySelector("code") as HTMLElement;

    return {
      preElement: preTag,
      copyCodeButton: copyCodeButton as HTMLButtonElement,
      codeElement: codeElement as HTMLElement,
    };
  };

  //  Find all of the 'pre' tags, then break into the specific code dom objects.
  const results = document.evaluate(
    "//pre",
    document,
    null,
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE
  );
  return Array.from(
    {
      length: results.snapshotLength,
    },
    (_, index) => results.snapshotItem(index) as HTMLPreElement
  )
    .map(preToDOM)
    .filter((element) => element); // filter out null elements
}

export function getUnprocessedCodeBlocks(window: Window): Array<HTMLElement> {
  const result = window.document.evaluate(
    queries.anyCodeBlocks,
    window.document,
    null,
    //  @ts-expect-error - jsdom is missing the 'XPathResult' types...
    window.XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    null
  );

  return Array.from({ length: result.snapshotLength }, (_, index) =>
    result.snapshotItem(index)
  )
    .map((element) => element as HTMLElement)
    .filter((element) => element); // filter out null elements
}
