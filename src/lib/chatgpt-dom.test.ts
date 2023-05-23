import { afterEach, beforeEach, describe, expect, test } from "@jest/globals";
import { findCodeBlocks, renderDiagram } from "./chatgpt-dom";
import { JSDOM, VirtualConsole } from "jsdom";
import { DisplayMode } from "./configuration";

//  Create a virtual console that suppresses the CSS errors we get loading the
//  ChatGPT sample (they can be safely ignored and pollute the console output
//  too much).
const virtualConsole = new VirtualConsole();
virtualConsole.sendTo(console, { omitJSDOMErrors: true });
virtualConsole.on("jsdomError", (err) => {
  if (/Could not parse CSS stylesheet/.test(err.message)) {
    return;
  }
  console.error(`Error uncaught: ${err.message.substring(0, 1024)}`);
  //  When I'm comfortable I've caught these JDOM issues we can log the error
  //  fully as below.
  // console.error(err);
});

describe("chatgpt-dom", () => {
  describe("findCodeBlocks", () => {
    test("finds the correct number of code blocks in the sample", async () => {
      //  Assert that we find the four code blocks in the sample file.
      const dom = await JSDOM.fromFile("./src/lib/__test_files__/sample.html", {
        virtualConsole,
      });
      const codeBlocks = findCodeBlocks(dom.window.document);
      expect(codeBlocks.length).toEqual(4);
    });

    test("finds the correct DOM elements that make up each code block", async () => {
      //  Assert that we find the four code blocks in the sample file.
      const dom = await JSDOM.fromFile("./src/lib/__test_files__/sample.html", {
        virtualConsole,
      });
      const codeBlocks = findCodeBlocks(dom.window.document);

      //  We're going to dig into each code block a bit more and assert the
      //  elements found are actually correct.
      const [
        sendRequestBlock,
        foodDeliveryBlock,
        messagingBlock,
        retryLogicBock,
      ] = codeBlocks;

      //  Assert we've found the 'send request' code sample elements.
      expect(sendRequestBlock.index).toEqual(0);
      const [srl1, srl2] = sendRequestBlock.code.split("\n");
      expect(srl1).toEqual(`graph LR`);
      expect(srl2).toEqual(`    A[Browser] --> B{Send HTTP Request}`);
      expect(
        sendRequestBlock.preElement.contains(sendRequestBlock.copyCodeButton)
      ).toEqual(true);
      expect(sendRequestBlock.copyCodeButton.textContent).toEqual("Copy code");

      //  Assert we've found the 'food delivery' code sample elements.
      expect(foodDeliveryBlock.index).toEqual(1);
      const [fdl1, fdl2] = foodDeliveryBlock.code.split("\n");
      expect(fdl1).toEqual(`classDiagram`);
      expect(fdl2).toEqual(`    class User {`);
      expect(
        foodDeliveryBlock.preElement.contains(foodDeliveryBlock.copyCodeButton)
      ).toEqual(true);
      expect(foodDeliveryBlock.copyCodeButton.textContent).toEqual("Copy code");

      //  Assert we've found the 'messaging architecture' code sample elements.
      expect(messagingBlock.index).toEqual(2);
      const [mal1, mal2] = messagingBlock.code.split("\n");
      expect(mal1).toEqual(`graph TB`);
      expect(mal2).toEqual(`    subgraph User Interface`);
      expect(
        messagingBlock.preElement.contains(messagingBlock.copyCodeButton)
      ).toEqual(true);
      expect(messagingBlock.copyCodeButton.textContent).toEqual("Copy code");

      //  Assert we've found the 'retry logic' code sample elements.
      expect(retryLogicBock.index).toEqual(3);
      const [rll1, rll2] = retryLogicBock.code.split("\n");
      expect(rll1).toEqual(`sequenceDiagram`);
      expect(rll2).toEqual(`    participant Producer`);
      expect(
        retryLogicBock.preElement.contains(retryLogicBock.copyCodeButton)
      ).toEqual(true);
      expect(retryLogicBock.copyCodeButton.textContent).toEqual("Copy code");
    });
  });

  describe("renderDiagram", () => {
    beforeEach(() => {
      //  It seems that jsdom doesn't handle the SVGElement 'getBBox' function.
      //  Return a box of any old size and the tests will function.
      //  @ts-expect-error - TS knows SVGElement doesn't have getBBox
      window.SVGElement.prototype.getBBox = () => ({
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      });
    });

    afterEach(() => {
      //  @ts-expect-error - TS knows SVGElement doesn't have getBBox
      delete window.SVGElement.prototype.getBBox;
    });

    test("can render simple graph below code", async () => {
      const chatHTML = `
    <div id="test-sample-1">
        <p>Here's a simple diagram:</p>
        <pre>
            <div>
                <div>
                    <span>mermaid</span>
                    <button>Show Diagram</button>
                    <button>Copy code</button>
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
      //  Setup the dom, get the code block, render the diagram.
      const dom = new JSDOM(chatHTML, { virtualConsole });
      const codeBlocks = findCodeBlocks(dom.window.document);
      const diagramDiv = await renderDiagram(
        dom.window.document,
        codeBlocks[0],
        DisplayMode.BelowDiagram
      );

      //  Get the test sample container div.
      //  Assert it has the expected children and no others (i.e. no mermaid
      //  error divs added).
      const testDiv = dom.window.document.querySelector(
        "#test-sample-1"
      ) as HTMLDivElement;
      expect(testDiv.children.length).toEqual(4);
      expect(testDiv.children[0]).toMatchObject({ nodeName: "P" });
      expect(testDiv.children[1]).toMatchObject({ nodeName: "PRE" });
      expect(testDiv.children[2]).toMatchObject({
        nodeName: "DIV",
        id: "chatgpt-diagram-container-0",
      });
      expect(testDiv.children[3]).toMatchObject({ nodeName: "P" });

      //  The diagram div should not be null, and should contain an SVG with
      //  the expected classes and id.
      const mermaidSvg = diagramDiv.firstChild as SVGElement;
      const parentDiv = diagramDiv.parentNode as HTMLDivElement;
      expect(diagramDiv).not.toBeFalsy();
      expect(diagramDiv.id).toEqual("chatgpt-diagram-container-0");
      //  Mermaid adds our diagram id to its generated SVG id.
      //  The actual id is just our id with a 'd' (for 'diagram') in front of it.
      expect(mermaidSvg.id).toContain("chatgpt-diagram-0");
      expect(parentDiv.id).toEqual("test-sample-1");

      //  We don't need to go overboard, but check that the SVG at least
      //  contains two node labels as expected (otherwise an empty SVG would
      //  pass the test, fixes GH issue #22).
      const [label1, label2] = mermaidSvg.querySelectorAll(".nodeLabel");
      expect(label1.textContent).toEqual("Browser");
      expect(label2.textContent).toEqual("Send HTTP Request");
    });

    test("does not pollute the global docucment body when rendering fails", async () => {
      const chatHTML = `
<div id="test-sample-2">
    <p>Here's an invalid diagram:</p>
    <pre>
        <div>
            <div>
                <span>mermaid</span>
                <button>Show Diagram</button>
                <button>Copy code</button>
            </div>
            <div>
                <code>
                  type Vector2D = {
                    x: number;
                    y: number;
                  };
                </code>
            </div>
        </div>
    </pre>
    <!-- we will validate that the container div and diagram is created here. -->
    <p>This flowchart illustrates a basic web request.</p>
</div>
`;
      //  Ensure the global document has not had error content added by mermaid,
      //  which is its default behaviour.
      expect(global.document.body.innerHTML).toEqual("");
      const dom = new JSDOM(chatHTML, { virtualConsole });
      const codeBlocks = findCodeBlocks(dom.window.document);
      await renderDiagram(
        dom.window.document,
        codeBlocks[0],
        DisplayMode.BelowDiagram
      );
      expect(global.document.body.innerHTML).toEqual("");
    });

    test("shows mermaidjs error content in the diagram container when rendering fails", async () => {
      const chatHTML = `
<div id="test-sample-2">
    <p>Here's an invalid diagram:</p>
    <pre>
        <div>
            <div>
                <span>mermaid</span>
                <button>Show Diagram</button>
                <button>Copy code</button>
            </div>
            <div>
                <code>
                  type Vector2D = {
                    x: number;
                    y: number;
                  };
                </code>
            </div>
        </div>
    </pre>
    <!-- we will validate that the container div and diagram is created here. -->
    <p>This flowchart illustrates a basic web request.</p>
</div>
`;
      //  Setup the dom, get the code block, render the diagram.
      const dom = new JSDOM(chatHTML, { virtualConsole });
      const codeBlocks = findCodeBlocks(dom.window.document);
      const containerDiv = await renderDiagram(
        dom.window.document,
        codeBlocks[0],
        DisplayMode.BelowDiagram
      );

      //  Check for the mermaid.js error output in the container.
      expect(containerDiv.querySelector(".error-text")?.textContent).toMatch(
        /Syntax error in text/
      );
    });
  });
});
