import mermaid from "mermaid";
import { findCodeBlocks, renderDiagram } from "./lib/chatgpt-dom";
import { DisplayMode } from "./lib/configuration";

const config = {
  scanForDiagramsIntervalMS: 1000,
};

mermaid.initialize({
  startOnLoad: false,
  theme: "forest",
});

//  First, we set up the triggers that we will use to identify when there are
//  new code blocks to check. If the page was static, we could just traverse
//  the DOM, however as it is (currently) rendered with React, the elements
//  are regularly re-created. To simplify the process of finding the code
//  elements, we just scan for them on a timer.
setInterval(() => updateDiagrams(), config.scanForDiagramsIntervalMS);

function updateDiagrams() {
  //  We search for any code blocks because at the moment ChatGPT rarely
  //  correctly classifies the code as mermaid (it is often rust/lus/scss, etc).
  const codeBlocks = findCodeBlocks(window.document);
  const unprocessedCodeBlocks = codeBlocks.filter((e) => !e.isProcessed);
  console.log(
    `Found ${unprocessedCodeBlocks.length}/${codeBlocks.length} unprocessed code blocks...`
  );

  // Loop through the unprocessed elements and add a button next to each one
  unprocessedCodeBlocks.forEach((codeBlock) => {
    //  Get the parent 'pre' tag, as well as the 'copy' button.
    const copyButton = codeBlock.copyCodeButton;

    //  TODO extract to DOM function
    // Create a button element
    const buttonHtml = `
<button class="flex ml-auto gap-2">Show Diagram</Button>
`;
    const showDiagramButton = new DOMParser().parseFromString(
      buttonHtml,
      "text/html"
    ).body.firstElementChild;
    if (!showDiagramButton) {
      throw new Error(`Unable to build 'Show Diagram' button`);
    }

    // Add an event listener to the button
    showDiagramButton.addEventListener("click", async () => {
      await renderDiagram(window.document, codeBlock, DisplayMode.AsTabs);
    });

    // Add the button to the DOM
    copyButton.before(showDiagramButton);

    //  Add the 'chatgpt-diagrams' class to the code block - this means we will
    //  exclude it from later searches.
    codeBlock.preElement.className += " chatgpt-diagrams";
  });
}
