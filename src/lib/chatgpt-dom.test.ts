import { describe, expect, test } from "@jest/globals";
import { findCodeBlocks } from "./chatgpt-dom";
import { JSDOM, VirtualConsole } from "jsdom";

function elementTextLines(element: HTMLElement): Array<string> {
  return (element.textContent || "").split("\n");
}

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
      const [srl1, srl2] = elementTextLines(sendRequestBlock.codeElement);
      expect(srl1).toEqual(`graph LR`);
      expect(srl2).toEqual(`    A[Browser] --> B{Send HTTP Request}`);
      expect(
        sendRequestBlock.preElement.contains(sendRequestBlock.copyCodeButton)
      ).toEqual(true);
      expect(sendRequestBlock.copyCodeButton.textContent).toEqual("Copy code");

      //  Assert we've found the 'food delivery' code sample elements.
      const [fdl1, fdl2] = elementTextLines(foodDeliveryBlock.codeElement);
      expect(fdl1).toEqual(`classDiagram`);
      expect(fdl2).toEqual(`    class User {`);
      expect(
        foodDeliveryBlock.preElement.contains(foodDeliveryBlock.copyCodeButton)
      ).toEqual(true);
      expect(foodDeliveryBlock.copyCodeButton.textContent).toEqual("Copy code");

      //  Assert we've found the 'messaging architecture' code sample elements.
      const [mal1, mal2] = elementTextLines(messagingBlock.codeElement);
      expect(mal1).toEqual(`graph TB`);
      expect(mal2).toEqual(`    subgraph User Interface`);
      expect(
        messagingBlock.preElement.contains(messagingBlock.copyCodeButton)
      ).toEqual(true);
      expect(messagingBlock.copyCodeButton.textContent).toEqual("Copy code");

      //  Assert we've found the 'retry logic' code sample elements.
      const [rll1, rll2] = elementTextLines(retryLogicBock.codeElement);
      expect(rll1).toEqual(`sequenceDiagram`);
      expect(rll2).toEqual(`    participant Producer`);
      expect(
        retryLogicBock.preElement.contains(retryLogicBock.copyCodeButton)
      ).toEqual(true);
      expect(retryLogicBock.copyCodeButton.textContent).toEqual("Copy code");
    });
  });
});
