import mermaid from "mermaid";
// import { findCodeBlocks, renderDiagram } from "./lib/chatgpt-dom";
import { findCodeBlocks } from "./lib/chatgpt-dom";
import { prepareCodeBlock } from "./lib/prepare-code-block";
//  import { DisplayMode } from "./lib/configuration";

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
    // const { showDiagramButton } = prepareCodeBlock(window.document, codeBlock);
    prepareCodeBlock(window.document, codeBlock);

    //  TOOD: also will be extracted into the prepare function
    // Add an event listener to the button
    // showDiagramButton.addEventListener("click", async () => {
    //   await renderDiagram(window.document, codeBlock, DisplayMode.AsTabs);
    // });
  });
}
