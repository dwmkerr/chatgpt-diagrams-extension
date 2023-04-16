import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'forest',
})

const config = {
  queries: {
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
  },
  scanForDiagramsIntervalMS: 1000,
};

//  First, we set up the triggers that we will use to identify when there are
//  new code blocks to check. If the page was static, we could just traverse
//  the DOM, however as it is (currently) rendered with React, the elements
//  are regularly re-created. To simplify the process of finding the code
//  elements, we just scan for them on a timer.
setInterval(() => updateDiagrams(null), config.scanForDiagramsIntervalMS);

function queryFindExactlyOneElement(xpathQuery, contextNode) {
  //  Run the xpath query, retrieving a snapshop.
  const snapshot = document.evaluate(xpathQuery, contextNode,
                                 null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
                                 null);

  //  If we did not find the expected number of results, bail.
  if (snapshot.snapshotLength !== 1) {
    const errorMessage = `failed to find exactly one element when running query '${xpathQuery}' - ${snapshot.snapshotLength} element(s) were found`;
    throw new Error(errorMessage);
  }

  //  Return the element we found.
  return snapshot.snapshotItem(0);
}

function updateDiagrams(nodesToScan) {
  //  We search for any code blocks because at the moment ChatGPT rarely
  //  correctly classifies the code as mermaid (it is often rust/lus/scss, etc).
  const elements = document.evaluate(config.queries.anyCodeBlocks, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
  console.log(`Found ${elements.snapshotLength} elements...`);

  // Loop through the elements and add a button next to each one
  for (let i = 0; i < elements.snapshotLength; i++) {
    //  Find the code element. From this, the overall parent 'pre' block, and
    //  the 'copy code' button.
    const codeElement = elements.snapshotItem(i);
    if (!codeElement) {
      console.error('Code block element is null, skipping...');
      continue;
    }

    //  Get the parent 'pre' tag, as well as the 'copy' button.
    const copyButton = queryFindExactlyOneElement(config.queries.associatedCopyCodeButton, codeElement);
    const preTag = queryFindExactlyOneElement(config.queries.associatedPreTag, codeElement);

    // Create a button element
    const showDiagramButton = document.createElement('button');
    showDiagramButton.innerText = 'Show Diagram';
    showDiagramButton.setAttribute('class', 'flex ml-auto gap-2');

    // Add an event listener to the button
    showDiagramButton.addEventListener('click', async () => {
      //  Get the code from the code element.
      const code = codeElement.innerText.trim();

      // Create a div element for the diagram
      const div = document.createElement('div');
      // div.setAttribute('class', 'mermaid');
      // div.setAttribute('data-processed', 'false');


      // Render the diagram using the Mermaid.js library
      try {
        const { svg } = await mermaid.render('mermaid-' + i, code);
        div.innerHTML = svg;
        //  We want to position the diagram after the <pre> tag that contains the
        //  code block.

        // Replace the element with the div
        preTag.after(div);
        // div.setAttribute('data-processed', 'true');
      } catch (err) {
        console.error("an error occurred rendering the diagram", err)
        div.remove();
      }
    });

    // Add the button to the DOM
    copyButton.before(showDiagramButton);

    //  Add the 'chatgpt-diagrams' class to the code block - this means we will
    //  exclude it from later searches.
    codeElement.className += ' chatgpt-diagrams';
  }
}

// Creates a new Mutation Observer
const observer = new MutationObserver((mutationList, observer) => {

  mutationList.forEach((mutation) => {
    switch (mutation.type) {
      case "childList":
        //  Update the diagrams.
        console.log("childList mutation, scanning for diagrams...");
        updateDiagrams(mutation.addedNodes);
      case "attributes":
        /* An attribute value changed on the element in
           mutation.target.
           The attribute name is in mutation.attributeName, and
           its previous value is in mutation.oldValue. */
        break;
    }
  });
})


//  Get the document body, cross-browser compatible.
var container = document.documentElement || document.body;

// Starts observing the child list of the element
observer.observe(document.body, {
  childList: true
})
