import { describe, expect, test } from "@jest/globals";
import { elementByTestId } from "./test-utils";
import { findCodeBlocks } from "./chatgpt-dom";
import { prepareCodeBlock } from "./prepare-code-block";

describe("prepare-code-block", () => {
  test("will not double-process code blocks", () => {
    document.body.innerHTML = `
      <div>
          <p>Here's a simple diagram:</p>
          <pre data-test-id="block">
              <div>
                  <div>
                      <span>mermaid</span>
                      <button data-test-id="copy">Copy code</button>
                  </div>
                  <div>
                      <code>graph LR
                          A[Browser] --&gt; B{Send HTTP Request}
                      </code>
                  </div>
              </div>
          </pre>
          <!-- we will validate that the container div and diagram is created here. -->
          <p>This flowchart illustrates a basic web request.</p>
      </div>
    `;

    //  Grab the code block from the sample.
    const [codeBlock] = findCodeBlocks(document);
    expect(codeBlock.isProcessed).toBeFalsy();

    //  The pre tag should have a class added to show it's been prepared.
    prepareCodeBlock(document, codeBlock);
    const preTag = elementByTestId(document, "block");
    expect(preTag.classList).toContain("chatgpt-diagrams-processed");

    //  If we search for code blocks again, this block should be marked as
    //  'processed'.
    const [codeBlockUpdated] = findCodeBlocks(document);
    expect(codeBlockUpdated.isProcessed).toBeTruthy();
  });

  test("can update the buttons in the toolbar and prep container divs", () => {
    document.body.innerHTML = `
      <div>
          <p>Here's a simple diagram:</p>
          <pre>
              <div>
                  <div data-test-id="toolbar">
                      <span>mermaid</span>
                      <!-- 'Show diagram' will go here. -->
                      <!-- 'Show code' will go here. -->
                      <button data-test-id="copy">Copy code</button>
                  </div>
                  <div>
                      <code>graph LR
                          A[Browser] --&gt; B{Send HTTP Request}
                      </code>
                  </div>
                  <!-- 'Diagram container' will go here. -->
              </div>
          </pre>
          <!-- we will validate that the container div and diagram is created here. -->
          <p>This flowchart illustrates a basic web request.</p>
      </div>
    `;

    //  Grab the code block from the sample.
    const [codeBlock] = findCodeBlocks(document);

    //  Prepare the code block, which will add all of our diagram scaffolding
    //  elements.
    const { showDiagramButton, showCodeButton, diagramTabContainer } =
      prepareCodeBlock(document, codeBlock);

    //  Assert the button text, style, location.
    const toolbar = elementByTestId(document, "toolbar");
    const copyCodeButton = elementByTestId(document, "copy");
    const showDiagramStyle = window.getComputedStyle(showDiagramButton);
    const showCodeStyle = window.getComputedStyle(showCodeButton);
    const tabContainerStyle = window.getComputedStyle(diagramTabContainer);

    expect(showDiagramButton.parentElement).toEqual(toolbar);
    expect(showDiagramButton.nextElementSibling).toEqual(showCodeButton);
    expect(showDiagramButton.innerText).toEqual("Show diagram");
    expect(showDiagramStyle.display).toEqual("inline-block");
    expect(showCodeButton.parentElement).toEqual(toolbar);
    expect(showCodeButton.nextElementSibling).toEqual(copyCodeButton);
    expect(showCodeButton.innerText).toEqual("Show code");
    expect(showCodeStyle.display).toEqual("none");
    expect(tabContainerStyle.display).toEqual("none");
  });
});
