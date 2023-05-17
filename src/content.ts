import mermaid from 'mermaid';
import * as chatgptElements from './lib/chatgpt-elements';

const config = {
  scanForDiagramsIntervalMS: 1000,
};

mermaid.initialize({
  startOnLoad: false,
  theme: 'forest',
})

//  First, we set up the triggers that we will use to identify when there are
//  new code blocks to check. If the page was static, we could just traverse
//  the DOM, however as it is (currently) rendered with React, the elements
//  are regularly re-created. To simplify the process of finding the code
//  elements, we just scan for them on a timer.
setInterval(() => updateDiagrams(), config.scanForDiagramsIntervalMS);

function updateDiagrams() {
  //  We search for any code blocks because at the moment ChatGPT rarely
  //  correctly classifies the code as mermaid (it is often rust/lus/scss, etc).
  const elements = chatgptElements.getUnprocessedCodeBlocks(window);
  console.log(`Found ${elements.length} unprocessed code blocks...`);

  // Loop through the elements and add a button next to each one
  elements.forEach((codeElement: HTMLElement, index: Number) => {
    //  Get the parent 'pre' tag, as well as the 'copy' button.
    const copyButton = chatgptElements.getCodeElementAssociatedCopyButton(window, codeElement);
    const preTag = chatgptElements.getCodeElementAssociatedPreTag(window, codeElement);

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
        const { svg } = await mermaid.render('mermaid-' + index, code);
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
  });
}
