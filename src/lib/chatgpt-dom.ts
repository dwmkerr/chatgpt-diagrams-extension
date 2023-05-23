import mermaid from "mermaid";
import { DisplayMode } from "./configuration";

export type ChatGPTCodeDOM = {
  //  If 'true' indicates that we have already created the diagram.
  isProcessed: boolean;

  //  The index of the block, i.e. the zero based order of the block in the
  //  document. This is used to create unique IDs.
  index: number;

  //  The actual code in the sample.
  code: string;

  //  The overall container 'pre' tag that holds the frame, buttons and code.
  preElement: HTMLPreElement;

  //  The 'copy code' button, we use this to quickly get a handle on the toolbar
  //  and insert adjacent buttons.
  copyCodeButton: HTMLButtonElement;

  //  The 'code' element that contains the mermaid code.
  codeElement: HTMLElement;
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
  const preToDOM = (preTag: HTMLPreElement, index: number) => {
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
      isProcessed: preTag.classList.contains("chatgpt-diagrams"),
      index,
      code: codeElement.textContent?.trim() || "",
      preElement: preTag,
      copyCodeButton: copyCodeButton as HTMLButtonElement,
      codeElement,
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

export async function renderDiagram(
  document: Document,
  codeBlock: ChatGPTCodeDOM,
  displayMode: DisplayMode
): Promise<HTMLDivElement> {
  //  Create the container element first. If we do not do this and provide a
  //  container to mermaid, then mermaid will pollute the global document object
  //  with error content at the end of the DOM.
  const diagramContainer = document.createElement("div");
  diagramContainer.id = `chatgpt-diagram-container-${codeBlock.index}`;

  //  TODO: really we should move this to _after_ the try block, but
  //  need to test in the browser and with unit tests first.

  switch (displayMode) {
    case DisplayMode.BelowDiagram:
      //  Put the digram after the 'pre' element.
      codeBlock.preElement.after(diagramContainer);
      break;

    case DisplayMode.AsTabs:
      //  Set the style of the container to match the code block, then
      //  put into the code div.
      diagramContainer.classList.add("p-4", "overflow-y-auto");
      (<HTMLElement>codeBlock.codeElement.parentNode).after(diagramContainer);
      break;

    default:
      throw new Error(`Unknown diagram display mode '${displayMode}`);
  }

  try {
    //  Render the diagram using the Mermaid.js library, then insert into our
    //  container.
    const { svg } = await mermaid.render(
      `chatgpt-diagram-${codeBlock.index}`,
      codeBlock.code,
      diagramContainer
    );
    diagramContainer.innerHTML = svg;
  } catch (err) {
    //  In the future we will return an error, but for now we will let the
    //  mermaid error UI content sit in the container, as this is fairly clear
    //  for the user. Later we can add more of our own branding and content.
    console.error("an error occurred rendering the diagram", err);
  }

  return diagramContainer;
}
