import { queryFindExactlyOneElement } from "./xpath";
import { JSDOM } from "jsdom";

describe.skip("xpath", () => {
  describe("queryFindExactlyOneElement", () => {
    test("throws if no elements are found", async () => {
      const dom = await JSDOM.fromFile(
        "./src/lib/__test_files__/code-blocks.html"
      );
      expect(queryFindExactlyOneElement(dom.window.document, "//code")).toThrow(
        /no elements/
      );
    });
  });
});
