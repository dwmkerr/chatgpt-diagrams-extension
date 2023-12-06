import mermaid from "mermaid";
import { findCodeBlocks } from "./lib/chatgpt-dom";
import { prepareCodeBlock } from "./lib/prepare-code-block";

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

  //  TODO we should find a way to include this kind of console output only when
  //  running locally (a bit like the developer title). Until then, disable it
  //  as it is noisy.
  // console.log(
  //   `Found ${unprocessedCodeBlocks.length}/${codeBlocks.length} unprocessed code blocks...`
  // );

  //  Loop through each unprocessed code block, then prepare each one, adding
  //  the diagram buttons and DOM elements.
  unprocessedCodeBlocks.forEach((codeBlock) => {
    prepareCodeBlock(window.document, codeBlock);
  });
}
