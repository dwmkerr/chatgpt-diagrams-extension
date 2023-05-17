/**
 * queryFindExactlyOneElement.
 *
 * @param {} document - the DOM document
 * @param {} xpathQuery - the XPath query to run
 * @param {} contextNode - the context node to start the query from, or null
 */
export function queryFindExactlyOneElement(window: Window, xpathQuery: string, contextNode: Element) {
  //  Run the xpath query, retrieving a snapshop.
  debugger; // TODO check window.XPathResult
  const snapshot = window.document.evaluate(
    xpathQuery,
    contextNode,
    null,
    //  @ts-expect-error - jsdom is missing the 'XPathResult' types...
    window.XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
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
